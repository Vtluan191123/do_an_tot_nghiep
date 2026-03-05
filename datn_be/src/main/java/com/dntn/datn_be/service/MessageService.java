package com.dntn.datn_be.service;

import com.dntn.datn_be.dto.request.MessageRequest;
import com.dntn.datn_be.dto.request.UserCreateRequest;
import com.dntn.datn_be.dto.request.UserUpdateRequest;
import com.dntn.datn_be.model.mongo.BaseMongoMessage;
import org.apache.catalina.User;

public interface MessageService extends BaseGlobalService<BaseMongoMessage, MessageRequest, String, MessageRequest,String>{

}
