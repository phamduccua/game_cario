package com.example.game_tien_tri.model.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PostGroupRequest {
    @NotNull(message = "Group id is not null")
    private Integer groupId;
    private String sort;
    private String typeSort;
}

