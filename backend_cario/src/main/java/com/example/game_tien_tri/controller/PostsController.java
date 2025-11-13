package com.example.game_tien_tri.controller;

import com.example.game_tien_tri.model.dto.PostDTO;
import com.example.game_tien_tri.model.request.PostGroupRequest;
import com.example.game_tien_tri.model.request.PostManagerResquest;
import com.example.game_tien_tri.model.request.PostRequest;
import com.example.game_tien_tri.model.response.PostManagerResponse;
import com.example.game_tien_tri.model.response.PostResponse;
import com.example.game_tien_tri.service.PostService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/posts/")
@RequiredArgsConstructor
public class PostsController {
    private final PostService postService;
    @PostMapping("create")
    public ResponseEntity<?> createPost(@Valid @RequestBody
                                        PostDTO postDTO,
                                        HttpServletRequest request,
                                        BindingResult bindingResult) {
        if (bindingResult.hasErrors()) {
            Map<String, String> errors = new HashMap<>();
            bindingResult.getFieldErrors().forEach(e -> {
                errors.put(e.getField(), e.getDefaultMessage());
            });
            return ResponseEntity.badRequest().body(errors);
        }
        try{
            PostDTO post = postService.createPost(postDTO, request);
            return ResponseEntity.ok(post);
        }catch(Exception e){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PutMapping("update")
    public ResponseEntity<?> updatePost(@Valid @RequestBody
                                        PostDTO postDTO,
                                        HttpServletRequest request,
                                        BindingResult bindingResult) {
        if (bindingResult.hasErrors()) {
            Map<String, String> errors = new HashMap<>();
            bindingResult.getFieldErrors().forEach(e -> {
                errors.put(e.getField(), e.getDefaultMessage());
            });
            return ResponseEntity.badRequest().body(errors);
        }
        PostDTO post = postService.updatePost(postDTO, request);
        return ResponseEntity.ok(post);

    }

    @PutMapping("update-status")
    public ResponseEntity<?> updatePostStatus(@RequestBody
                                              Map<String, String> map,
                                              HttpServletRequest request) {
        try{
            Integer id = Integer.parseInt(map.get("id"));
            Integer status = Integer.parseInt(map.get("status"));
            PostDTO post = postService.updateStatus(id, status, request);
            return ResponseEntity.ok(post);
        }catch (Exception e){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Data is not valid");
        }
    }

    @DeleteMapping("delete/{id}")
    public ResponseEntity<?> deletePost(@PathVariable Integer id, HttpServletRequest request) {
        postService.deletePost(id, request);
        return ResponseEntity.ok("Deleted post: " + id);
    }

    @GetMapping("get")
    public ResponseEntity<?> getAllPosts(PostRequest postRequest,
                                         HttpServletRequest request) {
        List<PostResponse> result = postService.getPost(postRequest, request);
        return ResponseEntity.ok(result);
    }

    @GetMapping("get/by-group")
    public ResponseEntity<?> getAllPostsByGroup(PostGroupRequest postGroupRequest, HttpServletRequest request) {
        List<PostResponse> result = postService.getByGoup(postGroupRequest, request);
        return ResponseEntity.ok(result);
    }

    @GetMapping("get/by-user")
    public ResponseEntity<?> getByUser(HttpServletRequest request) {
        List<PostResponse> result = postService.getByUser(request);
        return ResponseEntity.ok(result);
    }

    @GetMapping("get/all")
    public ResponseEntity<?> getAll(@Valid PostManagerResquest postManagerResquest,
                                    HttpServletRequest request,
                                    BindingResult bindingResult) {
        if(bindingResult.hasErrors()) {
            Map<String, String> errors = new HashMap<>();
            bindingResult.getFieldErrors().forEach(e -> {
                errors.put(e.getField(), e.getDefaultMessage());
            });
            return ResponseEntity.badRequest().body(errors);
        }
        List<PostManagerResponse> result = postService.getAll(postManagerResquest, request);
        return ResponseEntity.ok(result);
    }

    @GetMapping("get/all/by-group")
    public ResponseEntity<?> getAllByGroup(@RequestParam(required = true) Integer groupId,
                                           @RequestParam(required = false) Integer status,
                                           HttpServletRequest request) {
        List<PostManagerResponse> result = postService.getAllByGroup(groupId, status, request);
        return ResponseEntity.ok(result);
    }

    @GetMapping("get/{id}")
    public ResponseEntity<?> getById(@PathVariable Integer id, HttpServletRequest request) {
        PostResponse post = postService.getById(id, request);
        return ResponseEntity.ok(post);
    }
}
