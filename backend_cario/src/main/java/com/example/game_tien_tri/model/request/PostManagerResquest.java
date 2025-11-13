package com.example.game_tien_tri.model.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class PostManagerResquest {
    @NotNull(message = "Title is not null")
    private String title;
    @NotNull(message = "Username is not null")
    private String usernameByPost;
    private Integer status;
}

