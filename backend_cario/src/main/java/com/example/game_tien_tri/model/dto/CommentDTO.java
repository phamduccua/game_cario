package com.example.game_tien_tri.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class CommentDTO {
    private Integer id;
    @NotBlank(message = "Content is not Blank")
    private String content;
    private Integer prentId;
    @NotNull(message = "Post is not null")
    private Integer postId;
}
