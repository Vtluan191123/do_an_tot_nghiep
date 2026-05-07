package com.dntn.datn_be.service.impl;

import com.dntn.datn_be.dto.common.ResponseGlobalDto;
import com.dntn.datn_be.dto.request.AiTrainingAnswerCreateRequest;
import com.dntn.datn_be.dto.request.AiTrainingAnswerFilterRequest;
import com.dntn.datn_be.dto.request.AiTrainingAnswerUpdateRequest;
import com.dntn.datn_be.dto.response.*;
import com.dntn.datn_be.model.AiTrainingAnswer;
import com.dntn.datn_be.model.AiTrainingQuestion;
import com.dntn.datn_be.repository.AiTrainingAnswerRepository;
import com.dntn.datn_be.repository.AiTrainingQuestionRepository;
import com.dntn.datn_be.service.AiTrainingAnswerService;
import com.dntn.datn_be.service.AiTrainingQuestionService;
import com.dntn.datn_be.service.UploadFileService;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@AllArgsConstructor
@Service
public class AiTrainingAnswerServiceImpl implements AiTrainingAnswerService {

    private final AiTrainingAnswerRepository aiTrainingAnswerRepository;
    private final AiTrainingQuestionRepository aiTrainingQuestionRepository;
    private final UploadFileService uploadFileService;

    @Override
    @Transactional
    public ResponseGlobalDto<AiTrainingAnswer> create(AiTrainingAnswerCreateRequest request)  {
        // ===== Upload image if type is image =====
        String imageUrl = null;
        if ("image".equals(request.getType()) && request.getImageFile() != null && !request.getImageFile().isEmpty()) {
            // Upload MultipartFile
            try {
                List<String> uploadedFiles = this.uploadFileService.uploads(List.of(request.getImageFile()));
                if (uploadedFiles != null && !uploadedFiles.isEmpty()) {
                    imageUrl = uploadedFiles.get(0); // Get first uploaded file path
                }
            } catch (IOException e) {
                e.printStackTrace();
            }
        }

        AiTrainingAnswer answer = AiTrainingAnswer.builder()
                .questionId(request.getQuestionId())
                .type(request.getType())
                .content(request.getContent())
                .position(request.getPosition() != null ? request.getPosition() : 0)
                .imageUrl(imageUrl)
                .build();

        aiTrainingAnswerRepository.save(answer);

        // ===== Update Question Status to 1 (Has Answer) =====
        AiTrainingQuestion question = aiTrainingQuestionRepository.findById(request.getQuestionId())
                .orElseThrow(() -> new RuntimeException("Question not found"));
        question.setStatus(1); // 1 = has answer
        aiTrainingQuestionRepository.save(question);

        return ResponseGlobalDto.<AiTrainingAnswer>builder()
                .status(HttpStatus.CREATED.value())
                .data(answer)
                .message("Create AI training answer successfully")
                .build();
    }

    @Override
    public ResponseGlobalDto<List<AiTrainingAnswer>> gets(AiTrainingAnswerFilterRequest request) {
        Page<AiTrainingAnswer> page = aiTrainingAnswerRepository.search(request);
        return ResponseGlobalDto.<List<AiTrainingAnswer>>builder()
                .status(HttpStatus.OK.value())
                .data(page.getContent())
                .count(page.getTotalElements())
                .message("Get list AI training answers successfully")
                .build();
    }

    @Override
    public ResponseGlobalDto<AiTrainingAnswer> get(AiTrainingAnswerFilterRequest request) {
        Page<AiTrainingAnswer> page = aiTrainingAnswerRepository.search(request);
        if (!page.hasContent()) {
            return ResponseGlobalDto.<AiTrainingAnswer>builder()
                    .status(HttpStatus.NOT_FOUND.value())
                    .message("AI training answer not found")
                    .build();
        }
        return ResponseGlobalDto.<AiTrainingAnswer>builder()
                .status(HttpStatus.OK.value())
                .data(page.getContent().get(0))
                .message("Get AI training answer successfully")
                .build();
    }

    @Override
    @Transactional
    public ResponseGlobalDto<AiTrainingAnswer> update(AiTrainingAnswerUpdateRequest request)  {
        AiTrainingAnswer answer = aiTrainingAnswerRepository.findById(request.getId())
                .orElseThrow(() -> new RuntimeException("AI training answer not found"));

        answer.setQuestionId(request.getQuestionId());
        answer.setType(request.getType());
        answer.setContent(request.getContent());
        answer.setPosition(request.getPosition());

        // ===== Handle image upload if type is image =====
        if ("image".equals(request.getType())) {
            // If new image is provided, upload it
            if (request.getImageFile() != null && !request.getImageFile().isEmpty()) {
                try {
                    List<String> uploadedFiles = this.uploadFileService.uploads(List.of(request.getImageFile()));
                    if (uploadedFiles != null && !uploadedFiles.isEmpty()) {
                        answer.setImageUrl(uploadedFiles.get(0)); // Get first uploaded file path
                    }
                }catch (IOException e) {
                    e.printStackTrace();
                }
            }
        } else {
            // If type is text, clear image
            answer.setImageUrl(null);
        }

        aiTrainingAnswerRepository.save(answer);

        // ===== Update Question Status to 1 (Has Answer) =====
        AiTrainingQuestion question = aiTrainingQuestionRepository.findById(request.getQuestionId())
                .orElseThrow(() -> new RuntimeException("Question not found"));
        question.setStatus(1); // 1 = has answer
        aiTrainingQuestionRepository.save(question);

        return ResponseGlobalDto.<AiTrainingAnswer>builder()
                .status(HttpStatus.OK.value())
                .data(answer)
                .message("Update AI training answer successfully")
                .build();
    }

    @Override
    public ResponseGlobalDto<Boolean> delete(Long id) throws Exception {
        aiTrainingAnswerRepository.deleteById(id);
        return ResponseGlobalDto.<Boolean>builder()
                .status(HttpStatus.OK.value())
                .data(true)
                .message("Delete AI training answer successfully")
                .build();
    }

    @Override
    @Transactional
    public ResponseGlobalDto<Boolean> deletes(List<Long> ids) {
        aiTrainingAnswerRepository.deleteAllById(ids);
        return ResponseGlobalDto.<Boolean>builder()
                .status(HttpStatus.OK.value())
                .data(true)
                .message("Delete AI training answers successfully")
                .build();
    }

    @Override
    public List<TopicDTO> getData() {
        List<AiTrainingProjection> data = aiTrainingAnswerRepository.getAllTrainingData();

        // GROUP LEVEL 1: Topic
        Map<String, List<AiTrainingProjection>> topicGroup = data.stream()
                .collect(Collectors.groupingBy(
                        x -> x.getCode(), // hoặc topicId nếu có
                        LinkedHashMap::new,
                        Collectors.toList()
                ));

        return topicGroup.values().stream().map(topicList -> {

            AiTrainingProjection firstTopic = topicList.get(0);

            // GROUP LEVEL 2: Question
            Map<String, List<AiTrainingProjection>> questionGroup = topicList.stream()
                    .collect(Collectors.groupingBy(
                            AiTrainingProjection::getQuestion,
                            LinkedHashMap::new,
                            Collectors.toList()
                    ));

            List<QuestionChildDTO> questions = questionGroup.values().stream()
                    .map(qList -> {

                        List<AnswerDTO> answers = qList.stream()
                                .map(a -> AnswerDTO.builder()
                                        .answer(a.getAnswer())
                                        .type(a.getType())
                                        .position(a.getPosition())
                                        .imageUrl(a.getImageUrl())
                                        .build())
                                .sorted(Comparator.comparing(AnswerDTO::getPosition))
                                .toList();

                        return QuestionChildDTO.builder()
                                .question(qList.get(0).getQuestion())
                                .answers(answers)
                                .build();
                    })
                    .toList();

            return TopicDTO.builder()
                    .code(firstTopic.getCode())
                    .topicName(firstTopic.getTopicName())
                    .questions(questions)
                    .build();

        }).toList();
    }
}

