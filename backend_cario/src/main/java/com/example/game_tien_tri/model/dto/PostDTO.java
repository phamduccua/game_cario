package com.example.game_tien_tri.model.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class PostDTO {
    private Integer id;
    @NotBlank(message = "Title is not blank")
    private String title;
    @NotBlank(message = "Content is not blank")
    private String content;
    private String type;
    private Integer status;
    private Integer groupId;
}
