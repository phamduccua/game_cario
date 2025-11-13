package com.example.game_tien_tri.controller;

import com.example.game_tien_tri.model.dto.LoginDTO;
import com.example.game_tien_tri.model.dto.RegisterDTO;
import com.example.game_tien_tri.model.response.LoginResponse;
import com.example.game_tien_tri.service.UserService;
import com.example.game_tien_tri.utils.JwtTokenUtils;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RequiredArgsConstructor
@RestController
@RequestMapping("/")
public class UserController {
    private final UserService userService;
    private final JwtTokenUtils jwtTokenUtils;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterDTO registerDTO, BindingResult bindingResult) {
        if(bindingResult.hasErrors()) {
            Map<String, String> errors = new HashMap<>();
            bindingResult.getAllErrors().forEach(error -> errors.put(error.getDefaultMessage(), error.getDefaultMessage()));
            return ResponseEntity.badRequest().body(errors);
        }
        userService.registerUser(registerDTO);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginDTO loginDTO, BindingResult bindingResult, HttpServletResponse response) {
        if(bindingResult.hasErrors()) {
            Map<String, String> errors = new HashMap<>();
            bindingResult.getAllErrors().forEach(error -> errors.put(error.getDefaultMessage(), error.getDefaultMessage()));
            return ResponseEntity.badRequest().body(errors);
        }
        LoginResponse login = userService.loginUser(loginDTO);
        int maxAge = jwtTokenUtils.getRemainingExpiration(login.getToken());
        ResponseCookie cookie = ResponseCookie.from("token", login.getToken())
                .httpOnly(true)
                .secure(true)       // ⚠️ local để false, server https để true
                .sameSite("None")    // bắt buộc khi cross-site (localhost:3000 -> 8080)
                .path("/")
                .maxAge(maxAge)
                .build();
        Map<String, String> body = new HashMap<>();
        body.put("role", login.getRole());
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(Map.of("role", login.getRole()));
    }
}
