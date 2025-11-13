package com.example.game_tien_tri.repository.custom;

import com.example.game_tien_tri.entity.PostEntity;
import com.example.game_tien_tri.model.request.PostGroupRequest;
import com.example.game_tien_tri.model.request.PostManagerResquest;
import com.example.game_tien_tri.model.request.PostRequest;

import java.util.List;

public interface PostRepositoryCustom {
    List<PostEntity> getAllPosts(PostRequest postRequest);
    List<PostEntity> getPostsGroup(PostGroupRequest postGroupRequest);
    List<PostEntity> getAll(PostManagerResquest postManagerResquest);
}
