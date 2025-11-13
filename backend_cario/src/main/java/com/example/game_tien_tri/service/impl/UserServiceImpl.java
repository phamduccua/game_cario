package com.example.game_tien_tri.service.impl;

import com.example.game_tien_tri.entity.UserEntity;
import com.example.game_tien_tri.model.dto.LoginDTO;
import com.example.game_tien_tri.model.dto.RegisterDTO;
import com.example.game_tien_tri.model.response.LoginResponse;
import com.example.game_tien_tri.repository.UserRepository;
import com.example.game_tien_tri.service.UserService;
import com.example.game_tien_tri.utils.JwtTokenUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private  final JwtTokenUtils jwtTokenUtils;
    @Override
    public void registerUser(RegisterDTO registerDTO) {
        if(userRepository.existsByEmail(registerDTO.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
        }
        else if(userRepository.existsByUsername(registerDTO.getUsername())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username already exists");
        }
        try{
            UserEntity userEntity = new UserEntity();
            userEntity.setUsername(registerDTO.getUsername());
            userEntity.setPassword(passwordEncoder.encode(registerDTO.getPassword()));
            userEntity.setEmail(registerDTO.getEmail());
            userEntity.setStatus(1);
            userEntity.setRole("USER");
            userRepository.save(userEntity);
        }catch(Exception e){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    @Override
    public LoginResponse loginUser(LoginDTO loginDTO) {
        Optional<UserEntity> user = userRepository.findByUsernameAndStatus(loginDTO.getUsername(), 1);
        if(user.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
        }
        UserEntity userEntity = user.get();
        if(!passwordEncoder.matches(loginDTO.getPassword(), userEntity.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Wrong password");
        }
        UsernamePasswordAuthenticationToken authenticationToken =
                new UsernamePasswordAuthenticationToken(
                        loginDTO.getUsername(), loginDTO.getPassword(),
                        userEntity.getAuthorities());
        authenticationManager.authenticate(authenticationToken);
        LoginResponse loginResponse = new LoginResponse();
        loginResponse.setToken(jwtTokenUtils.generateToken(userEntity));
        loginResponse.setRole(userEntity.getRole());
        return loginResponse;
    }
}
