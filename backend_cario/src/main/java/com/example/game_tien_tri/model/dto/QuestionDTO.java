package com.example.game_tien_tri.model.dto;


import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class QuestionDTO {
    private Integer id;
    @NotBlank(message = "Content is not blank")
    private String content;
    private String type;
    private List<AnswerDTO> answers;
}
