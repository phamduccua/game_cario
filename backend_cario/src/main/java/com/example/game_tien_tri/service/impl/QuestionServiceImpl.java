package com.example.game_tien_tri.service.impl;

import com.example.game_tien_tri.convert.QuestionConvert;
import com.example.game_tien_tri.entity.AnswerEntity;
import com.example.game_tien_tri.entity.QuestionEntity;
import lombok.RequiredArgsConstructor;
import com.example.game_tien_tri.model.dto.AnswerDTO;
import com.example.game_tien_tri.model.dto.QuestionDTO;
import com.example.game_tien_tri.model.response.AnswerResponse;
import com.example.game_tien_tri.model.response.QuestionResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import com.example.game_tien_tri.repository.AnswerRepository;
import com.example.game_tien_tri.repository.QuestionRepository;
import com.example.game_tien_tri.service.QuestionService;
import org.springframework.web.server.ResponseStatusException;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class QuestionServiceImpl implements QuestionService {
    private final QuestionConvert questionConvert;
    private final QuestionRepository questionRepository;
    private final AnswerRepository answerRepository;
    @Override
    public QuestionDTO createQuestion(QuestionDTO question) {
        try{
            QuestionEntity questionEntity = questionConvert.toQuestionEntity(question);
            questionRepository.save(questionEntity);
            List<AnswerDTO> list = new ArrayList<>();
            for(AnswerDTO it : question.getAnswers()) {
                AnswerEntity answerEntity = new AnswerEntity();
                answerEntity.setQuestion(questionEntity);
                answerEntity.setContent(it.getContent());
                AnswerEntity sv = answerRepository.save(answerEntity);
                list.add(new AnswerDTO(sv.getId(), sv.getContent()));
                questionEntity.getAnswers().add(answerEntity);
            }
            QuestionEntity save = questionRepository.save(questionEntity);
            return new QuestionDTO(save.getId(), save.getContent(), save.getType(), list);
        }catch(Exception e){
            throw new RuntimeException(e);
        }
    }

    @Override
    public QuestionDTO updateQuestion(QuestionDTO questionDTO) {
        if(questionDTO.getId() == null) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Question id is not null");
        }
        QuestionEntity questionEntity = questionRepository.
                findById(questionDTO.getId()).
                orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Question not found"));
        try{
            List<Integer> existingAnswerIds = questionEntity.getAnswers().stream()
                    .map(AnswerEntity::getId)
                    .toList();

            for (AnswerDTO answerDTO : questionDTO.getAnswers()) {
                if (answerDTO.getId() == null || !existingAnswerIds.contains(answerDTO.getId())) {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "Answer id " + answerDTO.getId() + " is invalid");
                }
            }

            questionEntity.setContent(questionDTO.getContent());
            questionEntity.setType(questionDTO.getType());
            for (AnswerEntity answerEntity : questionEntity.getAnswers()) {
                questionDTO.getAnswers().stream()
                        .filter(dto -> dto.getId().equals(answerEntity.getId()))
                        .findFirst()
                        .ifPresent(dto -> answerEntity.setContent(dto.getContent()));
            }

            QuestionEntity saved = questionRepository.save(questionEntity);

            List<AnswerDTO> answerDTOs = saved.getAnswers().stream()
                    .map(ans -> new AnswerDTO(ans.getId(), ans.getContent()))
                    .toList();

            return new QuestionDTO(saved.getId(), saved.getContent(), saved.getType(), answerDTOs);
        }catch(Exception e){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    @Override
    public void deleteQuestion(Integer id) {
        try{
            questionRepository.deleteById(id);
        }catch(Exception e){
            throw new RuntimeException(e);
        }
    }

    @Override
    public List<QuestionResponse> getQuestion(String type) {
        if(type.isEmpty()){
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Type is not null");
        }
        List<QuestionResponse> result = new ArrayList<>();
        List<QuestionEntity> list = questionRepository.findByType(type);
        for(QuestionEntity it : list){
            QuestionResponse questionResponse = questionConvert.toQuestionResponse(it);
            List<AnswerEntity> answers = it.getAnswers();
            List<AnswerResponse> answerResponses = new ArrayList<>();
            for(AnswerEntity i : answers){
                AnswerResponse answerResponse = new AnswerResponse();
                answerResponse.setId(i.getId());
                answerResponse.setContent(i.getContent());
                answerResponses.add(answerResponse);
            }
            questionResponse.setAnswers(answerResponses);
            result.add(questionResponse);
        }
        return result;
    }
}
