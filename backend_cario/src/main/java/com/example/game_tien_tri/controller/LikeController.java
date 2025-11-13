package com.example.game_tien_tri.controller;

import com.example.game_tien_tri.model.dto.LikeDTO;
import com.example.game_tien_tri.service.LikeService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/")
public class LikeController {
    private final LikeService likeService;

    @PutMapping("like")
    public ResponseEntity<?> likeOrUnLike(@RequestBody LikeDTO likeDTO, HttpServletRequest request) {
        likeService.like(likeDTO, request);
        return ResponseEntity.ok().build();
    }
}