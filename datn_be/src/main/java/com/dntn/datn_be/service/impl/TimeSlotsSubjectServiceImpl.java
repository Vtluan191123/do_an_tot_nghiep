package com.dntn.datn_be.service.impl;

import com.dntn.datn_be.dto.common.ResponseGlobalDto;
import com.dntn.datn_be.dto.request.TimeSlotsSubjectUpdateRequest;
import com.dntn.datn_be.dto.request.TimeSlotsSubjectFilterRequest;
import com.dntn.datn_be.dto.response.TimeSlotsSubjectResponse;
import com.dntn.datn_be.dto.response.CoachWeeklyScheduleResponse;
import com.dntn.datn_be.model.TimeSlots;
import com.dntn.datn_be.model.TimeSlotsSubject;
import com.dntn.datn_be.model.TrainingRoom;
import com.dntn.datn_be.model.Subject;
import com.dntn.datn_be.repository.TimeSlotsRepository;
import com.dntn.datn_be.repository.TimeSlotsSubjectRepository;
import com.dntn.datn_be.repository.SubjectRepository;
import com.dntn.datn_be.repository.TrainingRoomRepository;
import com.dntn.datn_be.repository.UserRepository;
import com.dntn.datn_be.service.AuthService;
import com.dntn.datn_be.service.TimeSlotsSubjectService;
import com.dntn.datn_be.model.Users;
import lombok.AllArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeanUtils;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.WeekFields;
import java.util.*;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class TimeSlotsSubjectServiceImpl implements TimeSlotsSubjectService {

    private static final Logger logger = LoggerFactory.getLogger(TimeSlotsSubjectServiceImpl.class);

    private final TimeSlotsSubjectRepository timeSlotsSubjectRepository;
    private final TimeSlotsRepository timeSlotsRepository;
    private final SubjectRepository subjectRepository;
    private final TrainingRoomRepository trainingRoomRepository;
    private final UserRepository userRepository;
    private final AuthService authService;

    @Override
    public ResponseGlobalDto<List<TimeSlotsSubjectResponse>> getBySubjectId(Long subjectId) {
        try {
            List<TimeSlotsSubject> timeSlots = timeSlotsSubjectRepository.findBySubjectId(subjectId);
            List<TimeSlotsSubjectResponse> responses = timeSlots.stream()
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());

            return ResponseGlobalDto.<List<TimeSlotsSubjectResponse>>builder()
                    .status(HttpStatus.OK.value())
                    .data(responses)
                    .count((long) responses.size())
                    .message("Get time slots by subject successfully")
                    .build();
        } catch (Exception e) {
            return ResponseGlobalDto.<List<TimeSlotsSubjectResponse>>builder()
                    .status(HttpStatus.BAD_REQUEST.value())
                    .message("Error: " + e.getMessage())
                    .build();
        }
    }

    @Override
    public ResponseGlobalDto<List<TimeSlotsSubjectResponse>> getByCoachId(Long coachId) {
        try {
            List<TimeSlotsSubject> timeSlots = timeSlotsSubjectRepository.findByCoachId(coachId);
            List<TimeSlotsSubjectResponse> responses = timeSlots.stream()
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());

            return ResponseGlobalDto.<List<TimeSlotsSubjectResponse>>builder()
                    .status(HttpStatus.OK.value())
                    .data(responses)
                    .count((long) responses.size())
                    .message("Get time slots by coach successfully")
                    .build();
        } catch (Exception e) {
            return ResponseGlobalDto.<List<TimeSlotsSubjectResponse>>builder()
                    .status(HttpStatus.BAD_REQUEST.value())
                    .message("Error: " + e.getMessage())
                    .build();
        }
    }

    @Override
    public ResponseGlobalDto<List<TimeSlotsSubjectResponse>> getByCoachIdAndSubjectId(Long coachId, Long subjectId) {
        try {
            List<TimeSlotsSubject> timeSlots = timeSlotsSubjectRepository.findByCoachIdAndSubjectId(coachId, subjectId);
            List<TimeSlotsSubjectResponse> responses = timeSlots.stream()
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());

            return ResponseGlobalDto.<List<TimeSlotsSubjectResponse>>builder()
                    .status(HttpStatus.OK.value())
                    .data(responses)
                    .count((long) responses.size())
                    .message("Get time slots by coach and subject successfully")
                    .build();
        } catch (Exception e) {
            return ResponseGlobalDto.<List<TimeSlotsSubjectResponse>>builder()
                    .status(HttpStatus.BAD_REQUEST.value())
                    .message("Error: " + e.getMessage())
                    .build();
        }
    }

    @Override
    public ResponseGlobalDto<TimeSlotsSubjectResponse> getById(Long id) {
        try {
            TimeSlotsSubject timeSlot = timeSlotsSubjectRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Time slot not found"));

            return ResponseGlobalDto.<TimeSlotsSubjectResponse>builder()
                    .status(HttpStatus.OK.value())
                    .data(mapToResponse(timeSlot))
                    .message("Get time slot successfully")
                    .build();
        } catch (Exception e) {
            return ResponseGlobalDto.<TimeSlotsSubjectResponse>builder()
                    .status(HttpStatus.BAD_REQUEST.value())
                    .message("Error: " + e.getMessage())
                    .build();
        }
    }

    @Override
    @Transactional
    public ResponseGlobalDto<TimeSlotsSubjectResponse> update(TimeSlotsSubjectUpdateRequest request) {
        try {
            TimeSlotsSubject timeSlot = timeSlotsSubjectRepository.findById(request.getId())
                    .orElseThrow(() -> new RuntimeException("Time slot not found"));

            String oldTrainingMethod = timeSlot.getTrainingMethods();

            if (request.getMaxCapacity() != null) {
                timeSlot.setMaxCapacity(request.getMaxCapacity());
            }
            if (request.getTrainingMethods() != null) {
                timeSlot.setTrainingMethods(request.getTrainingMethods());
            }
            if (request.getCurrentCapacity() != null) {
                // Validate: currentCapacity không được vượt quá maxCapacity
                if (request.getCurrentCapacity() > (request.getMaxCapacity() != null ? request.getMaxCapacity() : timeSlot.getMaxCapacity())) {
                    return ResponseGlobalDto.<TimeSlotsSubjectResponse>builder()
                            .status(HttpStatus.BAD_REQUEST.value())
                            .message("Error: Số học viên đã đăng ký không được vượt quá sức chứa tối đa")
                            .build();
                }
                timeSlot.setCurrentCapacity(request.getCurrentCapacity());
            }

            TimeSlotsSubject updated = timeSlotsSubjectRepository.save(timeSlot);

            // ===== Handle TrainingRoom Logic =====
            Optional<TrainingRoom> existingRoom = trainingRoomRepository.findByTimeSlotsSubjectId(request.getId());
            String newTrainingMethod = request.getTrainingMethods() != null ? request.getTrainingMethods() : oldTrainingMethod;

            // Case 1: Changed from ONLINE to OFFLINE - Delete TrainingRoom
            if (oldTrainingMethod.equalsIgnoreCase("ONLINE") && newTrainingMethod.equalsIgnoreCase("OFFLINE")) {
                if (existingRoom.isPresent()) {
                    trainingRoomRepository.delete(existingRoom.get());
                    logger.info("Deleted training room for TimeSlotsSubject[id={}] (ONLINE -> OFFLINE)", request.getId());
                }
            }
            // Case 2: Changed to ONLINE or remained ONLINE
            else if (newTrainingMethod.equalsIgnoreCase("ONLINE")) {
                // Case 2a: Training room already exists - Update it
                if (existingRoom.isPresent()) {
                    TrainingRoom room = existingRoom.get();
                    room.setMaxCapacity(updated.getMaxCapacity());
                    room.setCurrentCapacity(updated.getCurrentCapacity());
                    trainingRoomRepository.save(room);
                    logger.info("Updated training room for TimeSlotsSubject[id={}]", request.getId());
                }
                // Case 2b: Training room doesn't exist - Create new one
                else {
                    String roomName = "Phòng Tập - " + request.getId();
                    TrainingRoom room = TrainingRoom.builder()
                            .timeSlotsSubjectId(request.getId())
                            .coachId(updated.getCoachId())
                            .subjectId(updated.getSubjectId())
                            .name(roomName)
                            .description("Online training room for time slot subject " + request.getId())
                            .maxCapacity(updated.getMaxCapacity())
                            .currentCapacity(0L)
                            .status("ACTIVE")
                            .build();
                    trainingRoomRepository.save(room);
                    logger.info("Created training room for TimeSlotsSubject[id={}] (changed to ONLINE)", request.getId());
                }
            }

            return ResponseGlobalDto.<TimeSlotsSubjectResponse>builder()
                    .status(HttpStatus.OK.value())
                    .data(mapToResponse(updated))
                    .message("Update time slot successfully")
                    .build();
        } catch (Exception e) {
            return ResponseGlobalDto.<TimeSlotsSubjectResponse>builder()
                    .status(HttpStatus.BAD_REQUEST.value())
                    .message("Error: " + e.getMessage())
                    .build();
        }
    }

    @Override
    @Transactional
    public ResponseGlobalDto<List<TimeSlotsSubjectResponse>> createForCoachAndSubject(Long coachId, Long subjectId) {
        try {
            // Get current logged-in user
            Users currentUser = authService.getCurrentUser();

            // Check if current user is authenticated
            if (currentUser == null) {
                return ResponseGlobalDto.<List<TimeSlotsSubjectResponse>>builder()
                        .status(HttpStatus.UNAUTHORIZED.value())
                        .message("Error: User is not authenticated")
                        .build();
            }

            // Check if current user is the coach (security check)
            if (!currentUser.getId().equals(coachId)) {
                return ResponseGlobalDto.<List<TimeSlotsSubjectResponse>>builder()
                        .status(HttpStatus.FORBIDDEN.value())
                        .message("Error: You don't have permission to create time slots for another coach")
                        .build();
            }

            // Get all time slots
            List<TimeSlots> allTimeSlots = timeSlotsRepository.findAllOrderByDateAndTime();

            List<TimeSlotsSubject> created = allTimeSlots.stream()
                    .map(timeSlot -> {
                        // Check if already exists
                        if (timeSlotsSubjectRepository.findBySubjectIdAndTimeSlotId(subjectId, timeSlot.getId()).isEmpty()) {
                            TimeSlotsSubject newSlot = TimeSlotsSubject.builder()
                                    .subjectId(subjectId)
                                    .timeSlotsId(timeSlot.getId())
                                    .maxCapacity(0L)
                                    .currentCapacity(0L)
                                    .trainingMethods("OFFLINE")
                                    .coachId(currentUser.getId())  // Use currentUser.getId() instead of coachId parameter
                                    .build();
                            return timeSlotsSubjectRepository.save(newSlot);
                        }
                        return null;
                    })
                    .filter(java.util.Objects::nonNull)
                    .collect(Collectors.toList());

            List<TimeSlotsSubjectResponse> responses = created.stream()
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());

            return ResponseGlobalDto.<List<TimeSlotsSubjectResponse>>builder()
                    .status(HttpStatus.CREATED.value())
                    .data(responses)
                    .count((long) responses.size())
                    .message("Create time slots for coach and subject successfully")
                    .build();
        } catch (Exception e) {
            return ResponseGlobalDto.<List<TimeSlotsSubjectResponse>>builder()
                    .status(HttpStatus.BAD_REQUEST.value())
                    .message("Error: " + e.getMessage())
                    .build();
        }
    }

    @Override
    @Transactional
    public ResponseGlobalDto<Boolean> deleteByCoachId(Long coachId) {
        try {
            timeSlotsSubjectRepository.deleteByCoachId(coachId);
            return ResponseGlobalDto.<Boolean>builder()
                    .status(HttpStatus.OK.value())
                    .data(true)
                    .message("Delete time slots by coach successfully")
                    .build();
        } catch (Exception e) {
            return ResponseGlobalDto.<Boolean>builder()
                    .status(HttpStatus.BAD_REQUEST.value())
                    .data(false)
                    .message("Error: " + e.getMessage())
                    .build();
        }
    }

    @Override
    @Transactional
    public ResponseGlobalDto<Boolean> deleteBySubjectId(Long subjectId) {
        try {
            timeSlotsSubjectRepository.deleteBySubjectId(subjectId);
            return ResponseGlobalDto.<Boolean>builder()
                    .status(HttpStatus.OK.value())
                    .data(true)
                    .message("Delete time slots by subject successfully")
                    .build();
        } catch (Exception e) {
            return ResponseGlobalDto.<Boolean>builder()
                    .status(HttpStatus.BAD_REQUEST.value())
                    .data(false)
                    .message("Error: " + e.getMessage())
                    .build();
        }
    }

    @Override
    public ResponseGlobalDto<CoachWeeklyScheduleResponse> getCoachWeeklySchedule(Long coachId, Integer weekNumber) {
        try {
            // Get current date
            LocalDate today = LocalDate.now();
            WeekFields weekFields = WeekFields.ISO;

            // Calculate week start date based on weekNumber offset
            // weekNumber 0 = current week, 1 = next week, -1 = previous week
            LocalDate calcWeekStart = today.with(weekFields.dayOfWeek(), 1);  // Monday of current week
            final LocalDate weekStartDate = calcWeekStart.plusWeeks(weekNumber);
            final LocalDate weekEndDate = weekStartDate.plusDays(6);  // Sunday of the week

            // Get all time slots for the coach
            List<TimeSlotsSubject> coachTimeSlots = timeSlotsSubjectRepository.findByCoachId(coachId);

            // Filter time slots for the specified week
            List<TimeSlotsSubject> weeklySlots = coachTimeSlots.stream()
                    .filter(slot -> {
                        if (slot.getTimeSlotsId() != null) {
                            Optional<TimeSlots> timeSlot = timeSlotsRepository.findById(slot.getTimeSlotsId());
                            if (timeSlot.isPresent() && timeSlot.get().getDate() != null) {
                                LocalDate slotDate = timeSlot.get().getDate();
                                return !slotDate.isBefore(weekStartDate) && !slotDate.isAfter(weekEndDate);
                            }
                        }
                        return false;
                    })
                    .collect(Collectors.toList());

            // Group by day of week (Monday to Sunday)
            Map<String, List<CoachWeeklyScheduleResponse.DayTimeSlotResponse>> dailySchedule = new LinkedHashMap<>();

            // Initialize all 7 days
            String[] daysOfWeek = {"Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"};
            for (String day : daysOfWeek) {
                dailySchedule.put(day, new ArrayList<>());
            }

            // Map day index to day name
            Map<Integer, String> dayIndexToName = new HashMap<>();
            dayIndexToName.put(1, "Monday");
            dayIndexToName.put(2, "Tuesday");
            dayIndexToName.put(3, "Wednesday");
            dayIndexToName.put(4, "Thursday");
            dayIndexToName.put(5, "Friday");
            dayIndexToName.put(6, "Saturday");
            dayIndexToName.put(7, "Sunday");

            // Populate daily schedule
            for (TimeSlotsSubject slot : weeklySlots) {
                if (slot.getTimeSlotsId() != null) {
                    TimeSlots timeSlot = timeSlotsRepository.findById(slot.getTimeSlotsId()).orElse(null);
                    if (timeSlot != null && timeSlot.getDate() != null) {
                        DayOfWeek dayOfWeek = timeSlot.getDate().getDayOfWeek();
                        String dayName = dayIndexToName.get(dayOfWeek.getValue());

                        CoachWeeklyScheduleResponse.DayTimeSlotResponse daySlot =
                            CoachWeeklyScheduleResponse.DayTimeSlotResponse.builder()
                                .timeSlotsId(timeSlot.getId())
                                .date(timeSlot.getDate())
                                .startTime(formatTime(timeSlot.getStartTime()))
                                .endTime(formatTime(timeSlot.getEndTime()))
                                .timeSlotsSubjectId(slot.getId())
                                .subjectId(slot.getSubjectId())
                                .maxCapacity(slot.getMaxCapacity())
                                .currentCapacity(slot.getCurrentCapacity())
                                .trainingMethods(slot.getTrainingMethods())
                                .coachId(slot.getCoachId())
                                .build();

                        dailySchedule.get(dayName).add(daySlot);
                    }
                }
            }

            // Sort time slots within each day by start time
            dailySchedule.values().forEach(slots ->
                slots.sort(Comparator.comparing(CoachWeeklyScheduleResponse.DayTimeSlotResponse::getStartTime))
            );

            // Calculate total weeks (assume 52 weeks in a year)
            int totalWeeks = 52;
            int currentPage = weekNumber + 26;  // Offset to make current week page 26

            CoachWeeklyScheduleResponse response = CoachWeeklyScheduleResponse.builder()
                    .weekNumber(weekNumber)
                    .weekStartDate(weekStartDate)
                    .weekEndDate(weekEndDate)
                    .dailySchedule(dailySchedule)
                    .currentPage(currentPage)
                    .totalWeeks(totalWeeks)
                    .build();

            return ResponseGlobalDto.<CoachWeeklyScheduleResponse>builder()
                    .status(HttpStatus.OK.value())
                    .data(response)
                    .message("Get coach weekly schedule successfully")
                    .build();
        } catch (Exception e) {
            return ResponseGlobalDto.<CoachWeeklyScheduleResponse>builder()
                    .status(HttpStatus.BAD_REQUEST.value())
                    .message("Error: " + e.getMessage())
                    .build();
        }
    }

    @Override
    public ResponseGlobalDto<List<TimeSlotsSubjectResponse>> getCoachTimeSlotsWithPagination(TimeSlotsSubjectFilterRequest request) {
        try {
            // Note: coachId is optional - if not provided, returns all time slots (public view)
            // If provided, returns only that coach's time slots

            // Set default pagination if not provided
            if (request.getPage() == null) {
                request.setPage(0);
            }
            if (request.getSize() == null) {
                request.setSize(10);
            }
            if (request.getSortBy() == null || request.getSortBy().isEmpty()) {
                request.setSortBy("date");
            }
            if (request.getSortDirection() == null || request.getSortDirection().isEmpty()) {
                request.setSortDirection("ASC");
            }

            // Use custom filter from repository
            org.springframework.data.domain.Page<TimeSlotsSubject> page = timeSlotsSubjectRepository.filter(request);

            // Batch fetch all subject names and coach names to avoid N+1 query problem
            Set<Long> subjectIds = new HashSet<>();
            Set<Long> coachIds = new HashSet<>();
            page.getContent().forEach(ts -> {
                if (ts.getSubjectId() != null) {
                    subjectIds.add(ts.getSubjectId());
                }
                if (ts.getCoachId() != null) {
                    coachIds.add(ts.getCoachId());
                }
            });

            Map<Long, Subject> subjectMap = new HashMap<>();
            if (!subjectIds.isEmpty()) {
                List<Subject> subjects = subjectRepository.findAllById(subjectIds);
                subjects.forEach(s -> subjectMap.put(s.getId(), s));
            }

            Map<Long, Users> coachMap = new HashMap<>();
            if (!coachIds.isEmpty()) {
                List<Users> coaches = userRepository.findAllById(coachIds);
                coaches.forEach(c -> coachMap.put(c.getId(), c));
            }

            // Map to response with subject and coach names
            List<TimeSlotsSubjectResponse> responses = page.getContent().stream()
                    .map(entity -> mapToResponseWithBatchData(entity, subjectMap, coachMap))
                    .collect(Collectors.toList());

            return ResponseGlobalDto.<List<TimeSlotsSubjectResponse>>builder()
                    .status(HttpStatus.OK.value())
                    .data(responses)
                    .count(page.getTotalElements())
                    .message("Get coach time slots with pagination successfully")
                    .build();
        } catch (IllegalArgumentException e) {
            return ResponseGlobalDto.<List<TimeSlotsSubjectResponse>>builder()
                    .status(HttpStatus.BAD_REQUEST.value())
                    .message("Error: " + e.getMessage())
                    .build();
        } catch (Exception e) {
            return ResponseGlobalDto.<List<TimeSlotsSubjectResponse>>builder()
                    .status(HttpStatus.BAD_REQUEST.value())
                    .message("Error: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Format LocalDateTime to time string (HH:mm)
     */
    private String formatTime(LocalDateTime dateTime) {
        if (dateTime == null) return "";
        return String.format("%02d:%02d", dateTime.getHour(), dateTime.getMinute());
    }

    private TimeSlotsSubjectResponse mapToResponse(TimeSlotsSubject entity) {
        TimeSlotsSubjectResponse response = new TimeSlotsSubjectResponse();
        BeanUtils.copyProperties(entity, response);

        // EXPLICITLY set capacity fields to ensure correct mapping
        response.setCurrentCapacity(entity.getCurrentCapacity());
        response.setMaxCapacity(entity.getMaxCapacity());

        // Get TimeSlots information and add to response
        if (entity.getTimeSlotsId() != null) {
            TimeSlots timeSlots = timeSlotsRepository.findById(entity.getTimeSlotsId()).orElse(null);
            if (timeSlots != null) {
                response.setDate(timeSlots.getDate());
                response.setStartTime(timeSlots.getStartTime());
                response.setEndTime(timeSlots.getEndTime());
            }
        }

        // Fetch and set subject name from SubjectRepository
        if (entity.getSubjectId() != null) {
            Subject subject = subjectRepository.findById(entity.getSubjectId()).orElse(null);
            if (subject != null) {
                response.setSubjectName(subject.getName());
            }
        }

        // Fetch and set coach full name from UserRepository
        if (entity.getCoachId() != null) {
            Users coach = userRepository.findById(entity.getCoachId()).orElse(null);
            if (coach != null) {
                response.setCoachFullName(coach.getFullName());
            }
        }

        return response;
    }

    /**
     * Map to response using pre-fetched subject and coach maps (for batch processing)
     */
    private TimeSlotsSubjectResponse mapToResponseWithSubjectMap(TimeSlotsSubject entity, Map<Long, Subject> subjectMap) {
        TimeSlotsSubjectResponse response = new TimeSlotsSubjectResponse();
        BeanUtils.copyProperties(entity, response);

        // EXPLICITLY set capacity fields to ensure correct mapping
        response.setCurrentCapacity(entity.getCurrentCapacity());
        response.setMaxCapacity(entity.getMaxCapacity());

        // Get TimeSlots information and add to response
        if (entity.getTimeSlotsId() != null) {
            TimeSlots timeSlots = timeSlotsRepository.findById(entity.getTimeSlotsId()).orElse(null);
            if (timeSlots != null) {
                response.setDate(timeSlots.getDate());
                response.setStartTime(timeSlots.getStartTime());
                response.setEndTime(timeSlots.getEndTime());
            }
        }

        // Set subject name from pre-fetched map
        if (entity.getSubjectId() != null && subjectMap.containsKey(entity.getSubjectId())) {
            Subject subject = subjectMap.get(entity.getSubjectId());
            response.setSubjectName(subject.getName());
        }

        // Fetch and set coach full name from UserRepository with null check
        String coachFullName = "N/A";
        if (entity.getCoachId() != null) {
            Users coach = userRepository.findById(entity.getCoachId()).orElse(null);
            if (coach != null && coach.getFullName() != null) {
                coachFullName = coach.getFullName();
            }
        }
        response.setCoachFullName(coachFullName);

        return response;
    }

    /**
     * Map to response using pre-fetched subject and coach maps (for batch processing)
     */
    private TimeSlotsSubjectResponse mapToResponseWithBatchData(TimeSlotsSubject entity, Map<Long, Subject> subjectMap, Map<Long, Users> coachMap) {
        TimeSlotsSubjectResponse response = new TimeSlotsSubjectResponse();

        // Copy basic properties
        BeanUtils.copyProperties(entity, response);

        // EXPLICITLY set capacity fields to ensure correct mapping
        response.setCurrentCapacity(entity.getCurrentCapacity());
        response.setMaxCapacity(entity.getMaxCapacity());

        logger.debug("Mapping TimeSlotsSubject[id={}] -> Response: currentCapacity={}, maxCapacity={}",
            entity.getId(), response.getCurrentCapacity(), response.getMaxCapacity());

        // Get TimeSlots information and add to response
        if (entity.getTimeSlotsId() != null) {
            TimeSlots timeSlots = timeSlotsRepository.findById(entity.getTimeSlotsId()).orElse(null);
            if (timeSlots != null) {
                response.setDate(timeSlots.getDate());
                response.setStartTime(timeSlots.getStartTime());
                response.setEndTime(timeSlots.getEndTime());
            }
        }

        // Set subject name from pre-fetched map
        if (entity.getSubjectId() != null && subjectMap.containsKey(entity.getSubjectId())) {
            Subject subject = subjectMap.get(entity.getSubjectId());
            response.setSubjectName(subject.getName());
        }

        // Set coach full name from pre-fetched map with null check
        String coachFullName = "N/A";
        if (entity.getCoachId() != null && coachMap.containsKey(entity.getCoachId())) {
            Users coach = coachMap.get(entity.getCoachId());
            if (coach != null && coach.getFullName() != null) {
                coachFullName = coach.getFullName();
            }
        }
        response.setCoachFullName(coachFullName);

        return response;
    }
}
