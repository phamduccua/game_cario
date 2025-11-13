package com.example.game_tien_tri.model.response;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
@Getter
@Setter
public class GroupResponse {
    private Integer id;
    private String name;
    private String description;
    private Boolean isPrivate;
    private LocalDateTime createdAt;
    private String userRole;
    private Integer countUserJoin;
}
