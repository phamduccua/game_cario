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
public class RegisterDTO {
    @NotBlank(message = "User name is not blank")
    private String username;
    private String password;
    private String confirmPassword;
    @NotBlank(message = "Email is not blank")
    private String email;
}
