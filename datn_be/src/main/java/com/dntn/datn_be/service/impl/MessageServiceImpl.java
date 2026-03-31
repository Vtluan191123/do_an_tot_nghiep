package com.dntn.datn_be.service.impl;

import com.dntn.datn_be.constants.MessageConstants;
import com.dntn.datn_be.dto.common.MessageDetailDto;
import com.dntn.datn_be.dto.common.ResponseGlobalDto;
import com.dntn.datn_be.dto.request.MessageDetailRequest;
import com.dntn.datn_be.dto.request.MessageRequest;
import com.dntn.datn_be.dto.request.UserCreateRequest;
import com.dntn.datn_be.dto.request.UserUpdateRequest;
import com.dntn.datn_be.model.GroudMessageUser;
import com.dntn.datn_be.model.mongo.BaseMongoMessage;
import com.dntn.datn_be.repository.GroudMessageUserRepository;
import com.dntn.datn_be.repository.mongo.BaseMongoMessageRepository;
import com.dntn.datn_be.service.AuthService;
import com.dntn.datn_be.service.MessageService;
import com.dntn.datn_be.service.UploadFileService;
import com.dntn.datn_be.service.WebSocketService;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.lang.Strings;
import io.micrometer.common.util.StringUtils;
import lombok.AllArgsConstructor;
import org.apache.catalina.User;
import org.aspectj.bridge.Message;
import org.hibernate.ObjectNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;

@AllArgsConstructor
@Service
public class MessageServiceImpl implements MessageService {

    private final String ENTITY = "MessageServiceImpl";
    private final BaseMongoMessageRepository baseMongoMessageRepository;
    private final UploadFileService uploadFileService;
    private final ObjectMapper objectMapper;
    private final WebSocketService webSocketService;
    private final GroudMessageUserRepository groudMessageUserRepository;
    private final AuthService authService;

    @Override
    @Transactional
    public ResponseGlobalDto<BaseMongoMessage> create(MessageRequest request) throws IOException {
        BaseMongoMessage message = null;
        try {
            MessageDetailDto messageDetailDto = handleMessage(request.getMessageDetailRequest());
             message = BaseMongoMessage.builder()
                    .groudId(request.getGroudId())
                    .messageDetail(messageDetailDto)
                    .senderId(request.getSenderId())
                    .build();
            this.baseMongoMessageRepository.save(message);
            //set isRead
            List<GroudMessageUser> groudMessageUsers = this.groudMessageUserRepository.findByGroudId(request.getGroudId());
            Long currentUserId = this.authService.getCurrentUser().getId();

            groudMessageUsers.forEach(user -> {
                if (user.getId().equals(currentUserId)) {
                    user.setRead(false);
                }else  {
                    user.setRead(true);
                }
            });

            this.groudMessageUserRepository.saveAll(groudMessageUsers);


            //send socket
            String topic = String.format(
                    "groudId:%s",
                    request.getGroudId()
            );
            this.webSocketService.sendMessage(topic,message,null);
        }catch (Exception e){
            return ResponseGlobalDto.<BaseMongoMessage>builder()
                    .status(HttpStatus.BAD_REQUEST.value())
                    .error(e.getMessage())
                    .build();
        }

        return ResponseGlobalDto.<BaseMongoMessage>builder()
                .status(HttpStatus.OK.value())
                .data(message)
                .message("Gửi tin nhắn thành công")
                .build();
    }

    MessageDetailDto handleMessage(MessageDetailRequest messageDetailRequest) throws IOException {

        String typeMessage = messageDetailRequest.getType().toLowerCase(Locale.ROOT);

        List<MultipartFile> files = messageDetailRequest.getFiles();
        MessageDetailDto messageDetailDto = new MessageDetailDto();

        switch (typeMessage) {
            case MessageConstants.MessageType.IMAGE:
            case MessageConstants.MessageType.VIDEO:
            case MessageConstants.MessageType.AUDIO: {
                List<String> listPaths = this.uploadFileService.uploads(files);
                messageDetailDto.setUrlFiles(listPaths);
                messageDetailDto.setType(typeMessage);
                break;
            }
            case MessageConstants.MessageType.ICON:
            case MessageConstants.MessageType.TEXT:{
                messageDetailDto.setType(typeMessage);
                messageDetailDto.setContent(messageDetailRequest.getContent());
            }
            default:
                break;
        }

        return messageDetailDto;
    }

    @Override
    public ResponseGlobalDto<List<BaseMongoMessage>> gets(String request) {
        List<BaseMongoMessage> messages = this.baseMongoMessageRepository.findByGroudId(request);
        List<GroudMessageUser> groudMessageUsers = this.groudMessageUserRepository.findByGroudId(request);
        Long currentUserId = this.authService.getCurrentUser().getId();

        groudMessageUsers.forEach(groudMessageUser -> {
            if (!groudMessageUser.getId().equals(currentUserId)) {
                groudMessageUser.setRead(true);
                this.groudMessageUserRepository.save(groudMessageUser);
            }
        });

        return ResponseGlobalDto.<List<BaseMongoMessage>>builder()
                .status(HttpStatus.OK.value())
                .data(messages)
                .count(messages.size())
                .message("Lấy danh sách tin nhắn thành công")
                .build();
    }

    @Override
    public ResponseGlobalDto<BaseMongoMessage> get(String request) {
        return null;
    }


    @Override
    public ResponseGlobalDto<BaseMongoMessage> update(MessageRequest request) {
        Optional<BaseMongoMessage> message = this.baseMongoMessageRepository.findById(request.getMessageId());
        if (message.isEmpty()) {
            throw  new ObjectNotFoundException(ENTITY,MessageServiceImpl.class);
        }
        MessageDetailRequest messageDetailRequest = request.getMessageDetailRequest();
        BaseMongoMessage messageObj = message.get();
        try{
            MessageDetailDto messageDetailDto = objectMapper.convertValue(messageObj.getMessageDetail(), MessageDetailDto.class);
            if(!messageDetailDto.getType().equals(MessageConstants.MessageType.TEXT)){
                ResponseGlobalDto.<BaseMongoMessage>builder()
                        .status(HttpStatus.BAD_REQUEST.value())
                        .error("Chỉ update đc tin nhắn với type là text")
                        .build();
            }
            if(messageDetailRequest.getEmote()!=null){
                messageDetailDto.setEmote(messageDetailRequest.getEmote());
            }

            if(Strings.hasText(messageDetailRequest.getContent())){
                messageDetailDto.setContent(messageDetailRequest.getContent());
            }
            if(request.isHide()){
                messageDetailDto.setContent("");
            }

            messageObj.setMessageDetail(messageDetailDto);
            this.baseMongoMessageRepository.save(messageObj);
            //send socket
            String topic = String.format(
                    "groudId:%s",
                    request.getGroudId()
            );
            this.webSocketService.sendMessage(topic,messageObj,null);
        }catch (Exception e){
            ResponseGlobalDto.<BaseMongoMessage>builder()
                    .status(HttpStatus.BAD_REQUEST.value())
                    .error(e.getMessage())
                    .build();
        }


        return ResponseGlobalDto.<BaseMongoMessage>builder()
                .status(HttpStatus.OK.value())
                .data(message.get())
                .message("Thay đổi tin nhắn thành công")
                .build();
    }

    @Override
    @Transactional
    public ResponseGlobalDto<Boolean> delete(String request) throws Exception {
        Optional<BaseMongoMessage> message = this.baseMongoMessageRepository.findById(request);

        if(message.isPresent()){
            BaseMongoMessage  baseMongoMessage = message.get();
            MessageDetailDto messageDetailDto = (MessageDetailDto) baseMongoMessage.getMessageDetail();
            String type = messageDetailDto.getType();
            List<String> urlFiles = messageDetailDto.getUrlFiles();
            if(!type.equals(MessageConstants.MessageType.TEXT)){
                //handle delete file
                uploadFileService.delete(urlFiles);
            }
            this.baseMongoMessageRepository.delete(baseMongoMessage);
            String topic = String.format(
                    "groudId:%s",
                    baseMongoMessage.getGroudId()
            );
            this.webSocketService.sendMessage(topic,request,null);
        }

        //hanlde
        return ResponseGlobalDto.<Boolean>builder()
                .status(HttpStatus.OK.value())
                .data(true)
                .message("Xóa tin nhắn thành công")
                .build();
    }

    @Override
    public ResponseGlobalDto<Boolean> deletes(List<String> request) {
        return null;
    }
}
