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
public class GroupDTO {
    private Integer id;
    @NotBlank(message = "Name is not blank")
    private String name;
    private String description;
    private Boolean isPrivate;
}
