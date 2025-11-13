package com.example.game_tien_tri.service;

import com.example.game_tien_tri.model.dto.LoginDTO;
import com.example.game_tien_tri.model.dto.RegisterDTO;
import com.example.game_tien_tri.model.response.LoginResponse;

public interface UserService {
    void registerUser(RegisterDTO registerDTO);
    LoginResponse loginUser(LoginDTO loginDTO);
}
