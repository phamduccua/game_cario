package com.example.game_tien_tri.model.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class QuestionResponse {
    private Integer id;
    private String content;
    private String type;
    private List<AnswerResponse> answers;
}
