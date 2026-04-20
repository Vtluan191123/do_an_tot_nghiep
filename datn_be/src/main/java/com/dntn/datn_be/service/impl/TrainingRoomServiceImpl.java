package com.dntn.datn_be.service.impl;

import com.dntn.datn_be.dto.common.ResponseGlobalDto;
import com.dntn.datn_be.dto.request.TrainingRoomCreateRequest;
import com.dntn.datn_be.dto.request.TrainingRoomFilterRequest;
import com.dntn.datn_be.dto.request.TrainingRoomUpdateRequest;
import com.dntn.datn_be.dto.response.TrainingRoomResponse;
import com.dntn.datn_be.model.*;
import com.dntn.datn_be.repository.*;
import com.dntn.datn_be.service.TrainingRoomService;
import lombok.AllArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class TrainingRoomServiceImpl implements TrainingRoomService {

    private final TrainingRoomRepository trainingRoomRepository;
    private final TimeSlotsSubjectRepository timeSlotsSubjectRepository;
    private final SubjectRepository subjectRepository;
    private final UserRepository userRepository;
    private final TimeSlotsRepository timeSlotsRepository;

    @Override
    public ResponseGlobalDto<List<TrainingRoomResponse>> getAll() {
        try {
            List<TrainingRoom> rooms = trainingRoomRepository.findAll();
            List<TrainingRoomResponse> responses = rooms.stream()
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());

            return ResponseGlobalDto.<List<TrainingRoomResponse>>builder()
                    .status(HttpStatus.OK.value())
                    .data(responses)
                    .count((long) responses.size())
                    .message("Get all training rooms successfully")
                    .build();
        } catch (Exception e) {
            return ResponseGlobalDto.<List<TrainingRoomResponse>>builder()
                    .status(HttpStatus.BAD_REQUEST.value())
                    .message("Error: " + e.getMessage())
                    .build();
        }
    }

    @Override
    public ResponseGlobalDto<TrainingRoomResponse> getById(Long id) {
        try {
            TrainingRoom room = trainingRoomRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Training room not found"));

            return ResponseGlobalDto.<TrainingRoomResponse>builder()
                    .status(HttpStatus.OK.value())
                    .data(mapToResponse(room))
                    .message("Get training room successfully")
                    .build();
        } catch (Exception e) {
            return ResponseGlobalDto.<TrainingRoomResponse>builder()
                    .status(HttpStatus.BAD_REQUEST.value())
                    .message("Error: " + e.getMessage())
                    .build();
        }
    }

    @Override
    public ResponseGlobalDto<TrainingRoomResponse> getByTimeSlotsSubjectId(Long timeSlotsSubjectId) {
        try {
            TrainingRoom room = trainingRoomRepository.findByTimeSlotsSubjectId(timeSlotsSubjectId)
                    .orElseThrow(() -> new RuntimeException("Training room not found for this time slot subject"));

            return ResponseGlobalDto.<TrainingRoomResponse>builder()
                    .status(HttpStatus.OK.value())
                    .data(mapToResponse(room))
                    .message("Get training room by time slot subject successfully")
                    .build();
        } catch (Exception e) {
            return ResponseGlobalDto.<TrainingRoomResponse>builder()
                    .status(HttpStatus.BAD_REQUEST.value())
                    .message("Error: " + e.getMessage())
                    .build();
        }
    }

    @Override
    public ResponseGlobalDto<List<TrainingRoomResponse>> getByCoachId(Long coachId) {
        try {
            List<TrainingRoom> rooms = trainingRoomRepository.findByCoachId(coachId);
            List<TrainingRoomResponse> responses = rooms.stream()
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());

            return ResponseGlobalDto.<List<TrainingRoomResponse>>builder()
                    .status(HttpStatus.OK.value())
                    .data(responses)
                    .count((long) responses.size())
                    .message("Get training rooms by coach successfully")
                    .build();
        } catch (Exception e) {
            return ResponseGlobalDto.<List<TrainingRoomResponse>>builder()
                    .status(HttpStatus.BAD_REQUEST.value())
                    .message("Error: " + e.getMessage())
                    .build();
        }
    }

    @Override
    public ResponseGlobalDto<List<TrainingRoomResponse>> getActiveByCoachId(Long coachId) {
        try {
            List<TrainingRoom> rooms = trainingRoomRepository.findByCoachIdAndStatus(coachId, "ACTIVE");
            List<TrainingRoomResponse> responses = rooms.stream()
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());

            return ResponseGlobalDto.<List<TrainingRoomResponse>>builder()
                    .status(HttpStatus.OK.value())
                    .data(responses)
                    .count((long) responses.size())
                    .message("Get active training rooms by coach successfully")
                    .build();
        } catch (Exception e) {
            return ResponseGlobalDto.<List<TrainingRoomResponse>>builder()
                    .status(HttpStatus.BAD_REQUEST.value())
                    .message("Error: " + e.getMessage())
                    .build();
        }
    }

    @Override
    public ResponseGlobalDto<List<TrainingRoomResponse>> getBySubjectId(Long subjectId) {
        try {
            List<TrainingRoom> rooms = trainingRoomRepository.findBySubjectId(subjectId);
            List<TrainingRoomResponse> responses = rooms.stream()
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());

            return ResponseGlobalDto.<List<TrainingRoomResponse>>builder()
                    .status(HttpStatus.OK.value())
                    .data(responses)
                    .count((long) responses.size())
                    .message("Get training rooms by subject successfully")
                    .build();
        } catch (Exception e) {
            return ResponseGlobalDto.<List<TrainingRoomResponse>>builder()
                    .status(HttpStatus.BAD_REQUEST.value())
                    .message("Error: " + e.getMessage())
                    .build();
        }
    }

    @Override
    public ResponseGlobalDto<List<TrainingRoomResponse>> getByStatus(String status) {
        try {
            List<TrainingRoom> rooms = trainingRoomRepository.findByStatus(status);
            List<TrainingRoomResponse> responses = rooms.stream()
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());

            return ResponseGlobalDto.<List<TrainingRoomResponse>>builder()
                    .status(HttpStatus.OK.value())
                    .data(responses)
                    .count((long) responses.size())
                    .message("Get training rooms by status successfully")
                    .build();
        } catch (Exception e) {
            return ResponseGlobalDto.<List<TrainingRoomResponse>>builder()
                    .status(HttpStatus.BAD_REQUEST.value())
                    .message("Error: " + e.getMessage())
                    .build();
        }
    }

    @Override
    public ResponseGlobalDto<Page<TrainingRoomResponse>> search(TrainingRoomFilterRequest request) {
        try {
            // Use custom filter method from repository
            Page<TrainingRoom> roomsPage = trainingRoomRepository.filter(request);
            Page<TrainingRoomResponse> responsePage = roomsPage.map(this::mapToResponse);

            return ResponseGlobalDto.<Page<TrainingRoomResponse>>builder()
                    .status(HttpStatus.OK.value())
                    .data(responsePage)
                    .message("Search training rooms successfully")
                    .build();
        } catch (Exception e) {
            return ResponseGlobalDto.<Page<TrainingRoomResponse>>builder()
                    .status(HttpStatus.BAD_REQUEST.value())
                    .message("Error: " + e.getMessage())
                    .build();
        }
    }

    @Override
    public ResponseGlobalDto<List<TrainingRoomResponse>> getOnlineRoomsForUser(Long userId) {
        try {
            List<TrainingRoom> rooms = trainingRoomRepository.findOnlineRoomsForUser(userId);

            // Batch fetch coaches and subjects
            Set<Long> coachIds = new HashSet<>();
            Set<Long> subjectIds = new HashSet<>();
            rooms.forEach(room -> {
                coachIds.add(room.getCoachId());
                subjectIds.add(room.getSubjectId());
            });

            Map<Long, Users> coachMap = new HashMap<>();
            if (!coachIds.isEmpty()) {
                List<Users> coaches = userRepository.findAllById(coachIds);
                coaches.forEach(c -> coachMap.put(c.getId(), c));
            }

            Map<Long, Subject> subjectMap = new HashMap<>();
            if (!subjectIds.isEmpty()) {
                List<Subject> subjects = subjectRepository.findAllById(subjectIds);
                subjects.forEach(s -> subjectMap.put(s.getId(), s));
            }

            // Map with batch data
            List<TrainingRoomResponse> responses = rooms.stream()
                    .map(room -> mapToResponseWithBatchData(room, coachMap, subjectMap))
                    .collect(Collectors.toList());

            return ResponseGlobalDto.<List<TrainingRoomResponse>>builder()
                    .status(HttpStatus.OK.value())
                    .data(responses)
                    .count((long) responses.size())
                    .message("Get online training rooms for user successfully")
                    .build();
        } catch (Exception e) {
            return ResponseGlobalDto.<List<TrainingRoomResponse>>builder()
                    .status(HttpStatus.BAD_REQUEST.value())
                    .message("Error: " + e.getMessage())
                    .build();
        }
    }

    private TrainingRoomResponse mapToResponseWithBatchData(TrainingRoom room, Map<Long, Users> coachMap, Map<Long, Subject> subjectMap) {
        // Get coach name from pre-fetched map, or query if not found
        String coachName = "N/A";
        System.out.println("DEBUG: coachId=" + room.getCoachId() + ", coachMap.size()=" + coachMap.size() + ", containsKey=" + coachMap.containsKey(room.getCoachId()));
        if (coachMap.containsKey(room.getCoachId())) {
            Users coach = coachMap.get(room.getCoachId());
            if (coach != null && coach.getFullName() != null) {
                coachName = coach.getFullName();
                System.out.println("DEBUG: Found coach in map: " + coachName);
            }
        } else {
            // Fallback: query from database if not in map
            Optional<Users> coach = userRepository.findById(room.getCoachId());
            if (coach.isPresent() && coach.get().getFullName() != null) {
                coachName = coach.get().getFullName();
                System.out.println("DEBUG: Found coach in DB: " + coachName);
            } else {
                System.out.println("DEBUG: Coach not found in DB or fullName is null");
            }
        }

        // Get subject name from pre-fetched map, or query if not found
        String subjectName = "N/A";
        if (subjectMap.containsKey(room.getSubjectId())) {
            Subject subject = subjectMap.get(room.getSubjectId());
            if (subject != null && subject.getName() != null) {
                subjectName = subject.getName();
            }
        } else {
            // Fallback: query from database if not in map
            Optional<Subject> subject = subjectRepository.findById(room.getSubjectId());
            if (subject.isPresent() && subject.get().getName() != null) {
                subjectName = subject.get().getName();
            }
        }

        // Get TimeSlotsSubject information
        Optional<TimeSlotsSubject> timeSlotsSubject = timeSlotsSubjectRepository.findById(room.getTimeSlotsSubjectId());

        // Get maxCapacity - prioritize room first (it's the direct value), then TimeSlotsSubject, default to 0
        Long maxCapacity = (room.getMaxCapacity() != null ? room.getMaxCapacity() :
                           (timeSlotsSubject.isPresent() && timeSlotsSubject.get().getMaxCapacity() != null ?
                            timeSlotsSubject.get().getMaxCapacity() : 0L));

        // Get currentCapacity - prioritize room first (it's the direct value), then TimeSlotsSubject, default to 0
        Long currentCapacity = (room.getCurrentCapacity() != null ? room.getCurrentCapacity() :
                               (timeSlotsSubject.isPresent() && timeSlotsSubject.get().getCurrentCapacity() != null ?
                                timeSlotsSubject.get().getCurrentCapacity() : 0L));

        String trainingMethods = timeSlotsSubject.map(TimeSlotsSubject::getTrainingMethods).orElse("OFFLINE");

        // Get date and time from TimeSlots
        LocalDate date = null;
        LocalDateTime startTime = null;
        LocalDateTime endTime = null;
        if (timeSlotsSubject.isPresent()) {
            Long timeSlotsId = timeSlotsSubject.get().getTimeSlotsId();
            if (timeSlotsId != null) {
                Optional<TimeSlots> timeSlots = timeSlotsRepository.findById(timeSlotsId);
                if (timeSlots.isPresent()) {
                    date = timeSlots.get().getDate();
                    startTime = timeSlots.get().getStartTime();
                    endTime = timeSlots.get().getEndTime();
                }
            }
        }

        return TrainingRoomResponse.builder()
                .id(room.getId())
                .timeSlotsSubjectId(room.getTimeSlotsSubjectId())
                .coachId(room.getCoachId())
                .coachName(coachName)
                .subjectId(room.getSubjectId())
                .subjectName(subjectName)
                .name(room.getName())
                .description(room.getDescription())
                .maxCapacity(maxCapacity)
                .currentCapacity(currentCapacity)
                .trainingMethods(trainingMethods)
                .date(date)
                .startTime(startTime)
                .endTime(endTime)
                .zoomLink(room.getZoomLink())
                .status(room.getStatus())
                .createdAt(room.getCreatedAt())
                .updatedAt(room.getUpdatedAt())
                .build();
    }

    @Override
    public ResponseGlobalDto<Page<TrainingRoomResponse>> getOnlineRoomsForUser(Long userId, Integer page, Integer size) {
        try {
            int pageNum = page != null ? page : 0;
            int pageSize = size != null ? size : 20;
            Pageable pageable = PageRequest.of(pageNum, pageSize, Sort.by(Sort.Direction.DESC, "createdAt"));

            Page<TrainingRoom> roomsPage = trainingRoomRepository.findOnlineRoomsForUser(userId, pageable);

            // Batch fetch coaches and subjects
            Set<Long> coachIds = new HashSet<>();
            Set<Long> subjectIds = new HashSet<>();
            roomsPage.getContent().forEach(room -> {
                coachIds.add(room.getCoachId());
                subjectIds.add(room.getSubjectId());
            });

            Map<Long, Users> coachMap = new HashMap<>();
            if (!coachIds.isEmpty()) {
                List<Users> coaches = userRepository.findAllById(coachIds);
                coaches.forEach(c -> coachMap.put(c.getId(), c));
            }

            Map<Long, Subject> subjectMap = new HashMap<>();
            if (!subjectIds.isEmpty()) {
                List<Subject> subjects = subjectRepository.findAllById(subjectIds);
                subjects.forEach(s -> subjectMap.put(s.getId(), s));
            }

            // Map with batch data
            Page<TrainingRoomResponse> responsePage = roomsPage.map(room ->
                mapToResponseWithBatchData(room, coachMap, subjectMap)
            );

            return ResponseGlobalDto.<Page<TrainingRoomResponse>>builder()
                    .status(HttpStatus.OK.value())
                    .data(responsePage)
                    .message("Get online training rooms for user with pagination successfully")
                    .build();
        } catch (Exception e) {
            return ResponseGlobalDto.<Page<TrainingRoomResponse>>builder()
                    .status(HttpStatus.BAD_REQUEST.value())
                    .message("Error: " + e.getMessage())
                    .build();
        }
    }

    @Override
    public ResponseGlobalDto<List<TrainingRoomResponse>> getOnlineRoomsForUserBySubject(Long userId, Long subjectId) {
        try {
            List<TrainingRoom> rooms = trainingRoomRepository.findOnlineRoomsForUserBySubject(userId, subjectId);

            // Batch fetch coaches and subjects
            Set<Long> coachIds = new HashSet<>();
            Set<Long> subjectIds = new HashSet<>();
            rooms.forEach(room -> {
                coachIds.add(room.getCoachId());
                subjectIds.add(room.getSubjectId());
            });

            Map<Long, Users> coachMap = new HashMap<>();
            if (!coachIds.isEmpty()) {
                List<Users> coaches = userRepository.findAllById(coachIds);
                coaches.forEach(c -> coachMap.put(c.getId(), c));
            }

            Map<Long, Subject> subjectMap = new HashMap<>();
            if (!subjectIds.isEmpty()) {
                List<Subject> subjects = subjectRepository.findAllById(subjectIds);
                subjects.forEach(s -> subjectMap.put(s.getId(), s));
            }

            // Map with batch data
            List<TrainingRoomResponse> responses = rooms.stream()
                    .map(room -> mapToResponseWithBatchData(room, coachMap, subjectMap))
                    .collect(Collectors.toList());

            return ResponseGlobalDto.<List<TrainingRoomResponse>>builder()
                    .status(HttpStatus.OK.value())
                    .data(responses)
                    .count((long) responses.size())
                    .message("Get online training rooms for user by subject successfully")
                    .build();
        } catch (Exception e) {
            return ResponseGlobalDto.<List<TrainingRoomResponse>>builder()
                    .status(HttpStatus.BAD_REQUEST.value())
                    .message("Error: " + e.getMessage())
                    .build();
        }
    }

    @Override
    @Transactional
    public ResponseGlobalDto<TrainingRoomResponse> create(TrainingRoomCreateRequest request) {
        try {
            // Check if training room already exists for this timeSlots subject
            if (trainingRoomRepository.findByTimeSlotsSubjectId(request.getTimeSlotsSubjectId()).isPresent()) {
                return ResponseGlobalDto.<TrainingRoomResponse>builder()
                        .status(HttpStatus.BAD_REQUEST.value())
                        .message("Error: Training room already exists for this time slot subject")
                        .build();
            }

            TrainingRoom room = TrainingRoom.builder()
                    .timeSlotsSubjectId(request.getTimeSlotsSubjectId())
                    .coachId(request.getCoachId())
                    .subjectId(request.getSubjectId())
                    .name(request.getName())
                    .description(request.getDescription())
                    .maxCapacity(request.getMaxCapacity())
                    .currentCapacity(0L)
                    .zoomLink(request.getZoomLink())
                    .status(request.getStatus() != null ? request.getStatus() : "ACTIVE")
                    .build();

            TrainingRoom saved = trainingRoomRepository.save(room);

            return ResponseGlobalDto.<TrainingRoomResponse>builder()
                    .status(HttpStatus.CREATED.value())
                    .data(mapToResponse(saved))
                    .message("Create training room successfully")
                    .build();
        } catch (Exception e) {
            return ResponseGlobalDto.<TrainingRoomResponse>builder()
                    .status(HttpStatus.BAD_REQUEST.value())
                    .message("Error: " + e.getMessage())
                    .build();
        }
    }

    @Override
    @Transactional
    public ResponseGlobalDto<TrainingRoomResponse> createForTimeSlotsSubject(Long timeSlotsSubjectId) {
        try {
            // Get TimeSlotsSubject
            TimeSlotsSubject timeSlotsSubject = timeSlotsSubjectRepository.findById(timeSlotsSubjectId)
                    .orElseThrow(() -> new RuntimeException("Time slot subject not found"));

            // Check if training room already exists
            if (trainingRoomRepository.findByTimeSlotsSubjectId(timeSlotsSubjectId).isPresent()) {
                return ResponseGlobalDto.<TrainingRoomResponse>builder()
                        .status(HttpStatus.BAD_REQUEST.value())
                        .message("Error: Training room already exists for this time slot subject")
                        .build();
            }

            // Create auto-generated name
            String roomName = "Phòng Tập - " + timeSlotsSubjectId;

            TrainingRoom room = TrainingRoom.builder()
                    .timeSlotsSubjectId(timeSlotsSubjectId)
                    .coachId(timeSlotsSubject.getCoachId())
                    .subjectId(timeSlotsSubject.getSubjectId())
                    .name(roomName)
                    .description("Online training room for time slot subject " + timeSlotsSubjectId)
                    .maxCapacity(timeSlotsSubject.getMaxCapacity() > 0 ? timeSlotsSubject.getMaxCapacity() : 50L)
                    .currentCapacity(0L)
                    .status("ACTIVE")
                    .build();

            TrainingRoom saved = trainingRoomRepository.save(room);

            return ResponseGlobalDto.<TrainingRoomResponse>builder()
                    .status(HttpStatus.CREATED.value())
                    .data(mapToResponse(saved))
                    .message("Create training room for time slot subject successfully")
                    .build();
        } catch (Exception e) {
            return ResponseGlobalDto.<TrainingRoomResponse>builder()
                    .status(HttpStatus.BAD_REQUEST.value())
                    .message("Error: " + e.getMessage())
                    .build();
        }
    }

    @Override
    @Transactional
    public ResponseGlobalDto<TrainingRoomResponse> update(TrainingRoomUpdateRequest request) {
        try {
            TrainingRoom room = trainingRoomRepository.findById(request.getId())
                    .orElseThrow(() -> new RuntimeException("Training room not found"));

            if (request.getName() != null) {
                room.setName(request.getName());
            }
            if (request.getDescription() != null) {
                room.setDescription(request.getDescription());
            }
            if (request.getMaxCapacity() != null) {
                room.setMaxCapacity(request.getMaxCapacity());
            }
            if (request.getCurrentCapacity() != null) {
                room.setCurrentCapacity(request.getCurrentCapacity());
            }
            if (request.getZoomLink() != null) {
                room.setZoomLink(request.getZoomLink());
            }
            if (request.getStatus() != null) {
                room.setStatus(request.getStatus());
            }

            TrainingRoom updated = trainingRoomRepository.save(room);

            return ResponseGlobalDto.<TrainingRoomResponse>builder()
                    .status(HttpStatus.OK.value())
                    .data(mapToResponse(updated))
                    .message("Update training room successfully")
                    .build();
        } catch (Exception e) {
            return ResponseGlobalDto.<TrainingRoomResponse>builder()
                    .status(HttpStatus.BAD_REQUEST.value())
                    .message("Error: " + e.getMessage())
                    .build();
        }
    }

    @Override
    @Transactional
    public ResponseGlobalDto<Boolean> delete(Long id) {
        try {
            trainingRoomRepository.deleteById(id);

            return ResponseGlobalDto.<Boolean>builder()
                    .status(HttpStatus.OK.value())
                    .data(true)
                    .message("Delete training room successfully")
                    .build();
        } catch (Exception e) {
            return ResponseGlobalDto.<Boolean>builder()
                    .status(HttpStatus.BAD_REQUEST.value())
                    .message("Error: " + e.getMessage())
                    .build();
        }
    }

    @Override
    @Transactional
    public ResponseGlobalDto<Boolean> deleteByCoachId(Long coachId) {
        try {
            trainingRoomRepository.deleteByCoachId(coachId);

            return ResponseGlobalDto.<Boolean>builder()
                    .status(HttpStatus.OK.value())
                    .data(true)
                    .message("Delete all training rooms for coach successfully")
                    .build();
        } catch (Exception e) {
            return ResponseGlobalDto.<Boolean>builder()
                    .status(HttpStatus.BAD_REQUEST.value())
                    .message("Error: " + e.getMessage())
                    .build();
        }
    }

    private TrainingRoomResponse mapToResponse(TrainingRoom room) {
        // Get subject information
        Optional<Subject> subject = subjectRepository.findById(room.getSubjectId());
        String subjectName = subject.map(Subject::getName).orElse("N/A");

        // Get coach (user) information
        Optional<Users> coach = userRepository.findById(room.getCoachId());
        String coachName = coach.map(Users::getFullName).orElse("N/A");

        // Get TimeSlotsSubject information
        Optional<TimeSlotsSubject> timeSlotsSubject = timeSlotsSubjectRepository.findById(room.getTimeSlotsSubjectId());
        Long maxCapacity = timeSlotsSubject.map(TimeSlotsSubject::getMaxCapacity).orElse(room.getMaxCapacity() != null ? room.getMaxCapacity() : 0L);
        Long currentCapacity = timeSlotsSubject.map(TimeSlotsSubject::getCurrentCapacity).orElse(room.getCurrentCapacity() != null ? room.getCurrentCapacity() : 0L);
        String trainingMethods = timeSlotsSubject.map(TimeSlotsSubject::getTrainingMethods).orElse("OFFLINE");

        // Get date and time from TimeSlots
        LocalDate date = null;
        LocalDateTime startTime = null;
        LocalDateTime endTime = null;
        if (timeSlotsSubject.isPresent()) {
            Long timeSlotsId = timeSlotsSubject.get().getTimeSlotsId();
            if (timeSlotsId != null) {
                Optional<TimeSlots> timeSlots = timeSlotsRepository.findById(timeSlotsId);
                if (timeSlots.isPresent()) {
                    date = timeSlots.get().getDate();
                    startTime = timeSlots.get().getStartTime();
                    endTime = timeSlots.get().getEndTime();
                }
            }
        }

        return TrainingRoomResponse.builder()
                .id(room.getId())
                .timeSlotsSubjectId(room.getTimeSlotsSubjectId())
                .coachId(room.getCoachId())
                .coachName(coachName)
                .subjectId(room.getSubjectId())
                .subjectName(subjectName)
                .name(room.getName())
                .description(room.getDescription())
                .maxCapacity(maxCapacity)
                .currentCapacity(currentCapacity)
                .trainingMethods(trainingMethods)
                .date(date)
                .startTime(startTime)
                .endTime(endTime)
                .zoomLink(room.getZoomLink())
                .status(room.getStatus())
                .createdAt(room.getCreatedAt())
                .updatedAt(room.getUpdatedAt())
                .build();
    }
}

