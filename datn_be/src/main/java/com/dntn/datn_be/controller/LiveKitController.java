package com.dntn.datn_be.controller;

import com.dntn.datn_be.service.LiveKitTokenService;
import org.springframework.web.bind.annotation.*;


import java.util.Map;


@RestController
@RequestMapping("/api/livekit")
public class LiveKitController {

    private final LiveKitTokenService tokenService;

    public LiveKitController(LiveKitTokenService tokenService) {
        this.tokenService = tokenService;
    }

    @PostMapping("/join_room")
    public Map<String, String> joinRoom(
            @RequestParam String roomId,
            @RequestParam String userName
    ) {
        String token = tokenService.createUrlLiveKit(roomId, userName);
        return Map.of("urlRoom", token);
    }
}
