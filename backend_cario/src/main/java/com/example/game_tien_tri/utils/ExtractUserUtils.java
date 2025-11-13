package com.example.game_tien_tri.utils;

import com.example.game_tien_tri.entity.UserEntity;
import com.example.game_tien_tri.repository.UserRepository;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ExtractUserUtils {
    private final JwtTokenUtils jwtTokenUtils;
    private final UserRepository userRepository;

    public UserEntity extract(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        String token = null;
        if(cookies != null){
            for(Cookie cookie : cookies){
                if(cookie.getName().equals("token")){
                    token = cookie.getValue();
                    break;
                }
            }
        }
        String username = jwtTokenUtils.extractUsername(token);
        UserEntity user = userRepository.findByUsernameAndStatus(username, 1).get();
        return user;
    }
}
