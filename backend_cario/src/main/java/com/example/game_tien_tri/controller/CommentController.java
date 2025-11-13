package com.example.game_tien_tri.controller;

import com.example.game_tien_tri.model.dto.CommentDTO;
import com.example.game_tien_tri.model.response.CommentResponse;
import com.example.game_tien_tri.service.CommentService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/comment")
public class CommentController {
    private final CommentService commentService;
    @PostMapping("create")
    public ResponseEntity<?> createComment(@Valid @RequestBody
                                               CommentDTO commentDTO,
                                           HttpServletRequest request,
                                           BindingResult bindingResult) {
        if (bindingResult.hasErrors()) {
            Map<String, String> errors = new HashMap<>();
            bindingResult.getFieldErrors().forEach(error -> {
                errors.put(error.getField(), error.getDefaultMessage());
            });
            return ResponseEntity.badRequest().body(errors);
        }
        CommentDTO comment = commentService.createComment(commentDTO, request);
        return ResponseEntity.ok(comment);
    }

    @DeleteMapping("delete/{id}")
    public ResponseEntity<?> deleteComment(@PathVariable Integer id, HttpServletRequest request) {
        commentService.deleteComment(id, request);
        return ResponseEntity.ok("Deleted comment: " + id);
    }

    @GetMapping("get/by-posts/{id}")
    public ResponseEntity<?> getCommentsByPosts(@PathVariable Integer id, HttpServletRequest request) {
        List<CommentResponse> result = commentService.getCommentByPost(id, request);
        return ResponseEntity.ok(result);
    }
}
