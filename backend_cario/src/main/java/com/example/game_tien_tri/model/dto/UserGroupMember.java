package com.example.game_tien_tri.model.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class UserGroupMember {
    private Integer id;
    private String username;
    private String urlAvatar;
}