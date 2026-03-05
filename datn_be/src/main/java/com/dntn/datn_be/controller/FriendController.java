package com.dntn.datn_be.controller;

import com.dntn.datn_be.dto.common.ResponseGlobalDto;
import com.dntn.datn_be.dto.request.MessageRequest;
import com.dntn.datn_be.model.mongo.BaseMongoMessage;
import com.dntn.datn_be.service.MessageService;
import com.dntn.datn_be.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@RequestMapping("/api/friend/")
@RequiredArgsConstructor
public class FriendController {
    private final UserService userService;

    @PostMapping("add")
    ResponseGlobalDto<Boolean> add(@RequestParam("userAddId") Integer userAddId,
                                              @RequestParam("userReceiverId") Integer userReceiverId) {
        return userService.addFiend(userAddId,userReceiverId);
    }

    @PutMapping("accept")
    ResponseGlobalDto<Boolean> accept(@RequestParam("userAddId") Integer userAddId,
                                     @RequestParam("userReceiverId") Integer userReceiverId){
        return userService.acceptAddFiend(userAddId,userReceiverId);
    }

    @PostMapping("cancel")
    ResponseGlobalDto<Boolean> cancel(@RequestParam("userAddId") Integer userAddId,
                                      @RequestParam("userReceiverId") Integer userReceiverId,
                                      @RequestParam("groudId") String groudId) {
        return userService.cancelFiend(userAddId,userReceiverId,groudId);
    }
}
