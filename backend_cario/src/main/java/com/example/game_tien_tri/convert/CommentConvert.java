package com.example.game_tien_tri.convert;

import com.example.game_tien_tri.entity.CommentEntity;
import com.example.game_tien_tri.entity.PostEntity;
import com.example.game_tien_tri.model.dto.CommentDTO;
import com.example.game_tien_tri.model.response.CommentResponse;
import com.example.game_tien_tri.repository.CommentRepository;
import com.example.game_tien_tri.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CommentConvert {
    private final ModelMapper modelMapper;
    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    public CommentEntity toCommentEntity(CommentDTO comment) {
        CommentEntity commentEntity = modelMapper.map(comment, CommentEntity.class);
        PostEntity postEntity = postRepository.findById(comment.getPostId()).get();
        if(comment.getPrentId() != null){
            CommentEntity commentEntity1 = commentRepository.findById(comment.getPrentId()).get();
            commentEntity.setParent(commentEntity1);
        }
        commentEntity.setPost(postEntity);
        return commentEntity;
    }

    public CommentResponse toCommentResponse(CommentEntity commentEntity) {
        CommentResponse commentResponse = modelMapper.map(commentEntity, CommentResponse.class);
        return commentResponse;
    }
}
