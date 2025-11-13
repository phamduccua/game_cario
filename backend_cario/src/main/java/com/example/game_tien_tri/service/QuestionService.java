package com.example.game_tien_tri.service;

import com.example.game_tien_tri.model.dto.QuestionDTO;
import com.example.game_tien_tri.model.response.QuestionResponse;

import java.util.List;

public interface QuestionService {
    QuestionDTO createQuestion(QuestionDTO question);
    QuestionDTO updateQuestion(QuestionDTO question);
    void deleteQuestion(Integer id);
    List<QuestionResponse> getQuestion(String type);
}
