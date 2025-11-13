package com.example.game_tien_tri.service;

import com.example.game_tien_tri.model.dto.LikeDTO;
import jakarta.servlet.http.HttpServletRequest;

public interface LikeService {
    void like(LikeDTO likeDTO, HttpServletRequest request);
}
