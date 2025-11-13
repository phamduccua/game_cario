package com.example.game_tien_tri.convert;

import com.example.game_tien_tri.entity.QuestionEntity;
import lombok.RequiredArgsConstructor;
import com.example.game_tien_tri.model.dto.QuestionDTO;
import com.example.game_tien_tri.model.response.QuestionResponse;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class QuestionConvert {
    private final ModelMapper modelMapper;

    public QuestionEntity toQuestionEntity(QuestionDTO questionDTO){
        QuestionEntity questionEntity = modelMapper.map(questionDTO, QuestionEntity.class);
        return questionEntity;
    }

    public QuestionResponse toQuestionResponse(QuestionEntity questionEntity){
        QuestionResponse questionResponse = modelMapper.map(questionEntity, QuestionResponse.class);
        return questionResponse;
    }
}
