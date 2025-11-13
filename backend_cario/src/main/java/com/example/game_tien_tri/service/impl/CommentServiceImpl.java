package com.example.game_tien_tri.service.impl;

import com.example.game_tien_tri.convert.CommentConvert;
import com.example.game_tien_tri.entity.CommentEntity;
import com.example.game_tien_tri.entity.UserEntity;
import com.example.game_tien_tri.model.dto.CommentDTO;
import com.example.game_tien_tri.model.dto.UserOfComment;
import com.example.game_tien_tri.model.response.CommentResponse;
import com.example.game_tien_tri.repository.CommentRepository;
import com.example.game_tien_tri.repository.LikeRepository;
import com.example.game_tien_tri.service.CommentService;
import com.example.game_tien_tri.utils.ExtractUserUtils;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class CommentServiceImpl implements CommentService {
    private final CommentConvert convert;
    private final CommentRepository repository;
    private final ExtractUserUtils extractUserUtils;
    private final LikeRepository likeRepository;

    @Override
    public CommentDTO createComment(CommentDTO comment, HttpServletRequest request) {
        try{
            UserEntity user = extractUserUtils.extract(request);
            comment.setId(null);
            CommentEntity commentEntity = convert.toCommentEntity(comment);
            commentEntity.setUser(user);
            if(comment.getPrentId() != null){
                CommentEntity commentParent = repository.findById(comment.getPrentId()).orElse(null);
                commentEntity.setParent(commentParent);
            }
            CommentEntity commented = repository.save(commentEntity);
            return new CommentDTO(commented.getId(),
                    commented.getContent(),
                    commented.getParent() != null ? commented.getParent().getId() : null,
                    commented.getPost().getId());
        }catch(Exception e){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }

    }

    @Override
    public void deleteComment(Integer id, HttpServletRequest request) {
        UserEntity user = extractUserUtils.extract(request);
        CommentEntity commentEntity = repository.findById(id).orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Comment not found"
        ));
        if(!user.getRole().equals("admin") && !Objects.equals(user.getId(), commentEntity.getUser().getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "User is not authorized to delete this comment");
        }
        repository.deleteById(id);
    }

    @Override
    public List<CommentResponse> getCommentByPost(Integer postId, HttpServletRequest request) {
        UserEntity userEntity = extractUserUtils.extract(request);
        try{
            List<CommentResponse> result = new ArrayList<>();
            List<CommentEntity> list = repository.findByPostId(postId);
            for(CommentEntity commentEntity : list){
                CommentResponse commentResponse = convert.toCommentResponse(commentEntity);
                UserEntity user = commentEntity.getUser();
                UserOfComment us = new UserOfComment();
                us.setUsername(user.getUsername());
                us.setUrlAvatar(us.getUrlAvatar());
                commentResponse.setUser(us);
                commentResponse.setLike(likeRepository.existsByUserIdAndCommentId(userEntity.getId(), commentEntity.getId()));
                commentResponse.setCountLike(likeRepository.countByUserIdAndCommentId(userEntity.getId(), commentEntity.getId()));
                List<CommentEntity> commentChildren = commentEntity.getChildren();
                List<CommentResponse> commentChildrenResponse = new ArrayList<>();
                for(CommentEntity commentChild : commentChildren){
                    CommentResponse commentChildResponse = convert.toCommentResponse(commentChild);
                    UserEntity userChild = commentChild.getUser();
                    UserOfComment usChild = new UserOfComment();
                    usChild.setUsername(userChild.getUsername());
                    usChild.setUrlAvatar(usChild.getUrlAvatar());
                    commentChildResponse.setUser(usChild);
                    commentChildrenResponse.add(commentChildResponse);
                }
                commentResponse.setCommentsChildren(commentChildrenResponse);
                result.add(commentResponse);
            }
            return result;
        }catch(Exception e){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }
}

