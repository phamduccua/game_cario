package com.example.game_tien_tri.convert;

import com.example.game_tien_tri.entity.PostEntity;
import com.example.game_tien_tri.model.dto.PostDTO;
import com.example.game_tien_tri.model.response.PostManagerResponse;
import com.example.game_tien_tri.model.response.PostResponse;
import com.example.game_tien_tri.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

@Component
@RequiredArgsConstructor
public class PostConvert {
    private final ModelMapper modelMapper;
    private final UserRepository userRepository;
    public PostEntity toPostEntity(PostDTO postDTO) {
        PostEntity postEntity = modelMapper.map(postDTO, PostEntity.class);
        if(postDTO.getType() == null || postDTO.getType().equals("")) {
            postEntity.setType("forum");
        }
        else if(!postDTO.getType().equals("blog") && !postDTO.getType().equals("forum")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Type is not valid");
//                    RuntimeException("The type can only be a blog or a forum.");
        }
        postEntity.setStatus(1);
        return postEntity;
    }

    public PostResponse toPostResponse(PostEntity postEntity) {
        PostResponse postResponse = modelMapper.map(postEntity, PostResponse.class);
        return postResponse;
    }

    public PostManagerResponse postManagerResponse(PostEntity postEntity) {
        PostManagerResponse postManagerResponse = modelMapper.map(postEntity, PostManagerResponse.class);
        return postManagerResponse;
    }
}
