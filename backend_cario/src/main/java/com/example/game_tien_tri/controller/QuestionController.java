package com.example.game_tien_tri.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import com.example.game_tien_tri.model.dto.QuestionDTO;
import com.example.game_tien_tri.model.response.QuestionResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import com.example.game_tien_tri.service.QuestionService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/question/")
public class QuestionController {
    private final QuestionService questionService;

    @PostMapping("create")
    public ResponseEntity<?> createQuestion(@Valid @RequestBody QuestionDTO questionDTO, BindingResult bindingResult) {
        if (bindingResult.hasErrors()) {
            Map<String, String> errors = new HashMap<>();
            bindingResult.getAllErrors().forEach(error -> errors.put(error.getDefaultMessage(), error.getDefaultMessage()));
            return ResponseEntity.badRequest().body(errors);
        }

        QuestionDTO result = questionService.createQuestion(questionDTO);
        return ResponseEntity.ok(result);
    }

    @PutMapping("update")
    public ResponseEntity<?> updateQuestion(@Valid @RequestBody QuestionDTO questionDTO, BindingResult bindingResult) {
        if (bindingResult.hasErrors()) {
            Map<String, String> errors = new HashMap<>();
            bindingResult.getAllErrors().forEach(error -> errors.put(error.getDefaultMessage(), error.getDefaultMessage()));
            return ResponseEntity.badRequest().body(errors);
        }
        QuestionDTO result = questionService.updateQuestion(questionDTO);
        return ResponseEntity.ok(result);
    }

    @DeleteMapping("delete/{id}")
    public ResponseEntity<?> deleteQuestion(@PathVariable Integer id) {
        questionService.deleteQuestion(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("get")
    public ResponseEntity<?> getQuestion(@RequestParam(required = true) String type) {
        List<QuestionResponse> result = questionService.getQuestion(type);
        return ResponseEntity.ok(result);
    }
}
