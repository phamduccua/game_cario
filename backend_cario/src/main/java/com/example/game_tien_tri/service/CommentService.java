package com.example.game_tien_tri.service;

import com.example.game_tien_tri.model.dto.CommentDTO;
import com.example.game_tien_tri.model.response.CommentResponse;
import jakarta.servlet.http.HttpServletRequest;

import java.util.List;

public interface CommentService {
    CommentDTO createComment(CommentDTO comment, HttpServletRequest request);
    void deleteComment(Integer id, HttpServletRequest request);
    List<CommentResponse> getCommentByPost(Integer postId, HttpServletRequest request);
}
