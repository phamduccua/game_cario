package com.example.game_tien_tri.service;

import com.example.game_tien_tri.model.dto.PostDTO;
import com.example.game_tien_tri.model.request.PostGroupRequest;
import com.example.game_tien_tri.model.request.PostManagerResquest;
import com.example.game_tien_tri.model.response.PostManagerResponse;
import com.example.game_tien_tri.model.request.PostRequest;
import com.example.game_tien_tri.model.response.PostResponse;
import jakarta.servlet.http.HttpServletRequest;

import java.util.List;

public interface PostService {
    PostDTO createPost (PostDTO postDTO, HttpServletRequest httpRequest);
    PostDTO updatePost (PostDTO postDTO, HttpServletRequest httpRequest);
    void deletePost (Integer postId, HttpServletRequest httpRequest);
    PostDTO updateStatus(Integer id, Integer status, HttpServletRequest httpRequest);
    List<PostResponse> getPost(PostRequest postRequest, HttpServletRequest httpRequest);
    List<PostResponse> getByGoup(PostGroupRequest postGroupRequest, HttpServletRequest request);
    List<PostResponse> getByUser(HttpServletRequest httpRequest);
    List<PostManagerResponse> getAll(PostManagerResquest postManagerResquest, HttpServletRequest request);
    List<PostManagerResponse> getAllByGroup(Integer id, Integer status ,HttpServletRequest httpRequest);
    PostResponse getById(Integer id, HttpServletRequest request);
}
