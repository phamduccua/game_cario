package com.example.game_tien_tri.service.impl;

import com.example.game_tien_tri.entity.CommentEntity;
import com.example.game_tien_tri.entity.LikeEntity;
import com.example.game_tien_tri.entity.PostEntity;
import com.example.game_tien_tri.entity.UserEntity;
import com.example.game_tien_tri.model.dto.LikeDTO;
import com.example.game_tien_tri.repository.CommentRepository;
import com.example.game_tien_tri.repository.LikeRepository;
import com.example.game_tien_tri.repository.PostRepository;
import com.example.game_tien_tri.service.LikeService;
import com.example.game_tien_tri.utils.ExtractUserUtils;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class LikeServiceImpl implements LikeService {
    private final LikeRepository likeRepository;
    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final ExtractUserUtils extractUserUtils;
    @Override
    public void like(LikeDTO likeDTO, HttpServletRequest request) {
        UserEntity user = extractUserUtils.extract(request);
        try{
            if(likeDTO.getCommentId() == null) {
                if(likeRepository.existsByUserIdAndPostId(user.getId(), likeDTO.getPostId())) {
                    LikeEntity likeEntity = likeRepository.findByUserIdAndPostId(user.getId(), likeDTO.getPostId());
                    likeRepository.delete(likeEntity);
                }
                else{
                    LikeEntity likeEntity = new LikeEntity();
                    PostEntity postEntity = postRepository.findById(likeDTO.getPostId()).orElse(null);
                    likeEntity.setUser(user);
                    likeEntity.setPost(postEntity);
                    likeRepository.save(likeEntity);
                }
            }
            else{
                if(likeRepository.existsByUserIdAndCommentId(user.getId(), likeDTO.getCommentId())) {
                    LikeEntity likeEntity = likeRepository.findByUserIdAndCommentId(user.getId(), likeDTO.getCommentId());
                    likeRepository.delete(likeEntity);
                }
                else{
                    LikeEntity likeEntity = new LikeEntity();
                    CommentEntity commentEntity = commentRepository.findById(likeDTO.getCommentId()).orElse(null);
                    likeEntity.setUser(user);
                    likeEntity.setComment(commentEntity);
                    likeRepository.save(likeEntity);
                }
            }
        }catch(Exception e){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }
}

