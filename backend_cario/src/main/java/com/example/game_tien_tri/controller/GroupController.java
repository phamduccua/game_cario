package com.example.game_tien_tri.controller;

import com.example.game_tien_tri.model.dto.GroupDTO;
import com.example.game_tien_tri.model.response.GroupResponse;
import com.example.game_tien_tri.service.GroupService;
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

@RequiredArgsConstructor
@RestController
@RequestMapping("group/")
public class GroupController {
    private final GroupService groupService;
    @PostMapping("create")
    public ResponseEntity<?> createGroup(@Valid @RequestBody GroupDTO groupDTO, BindingResult bindingResult, HttpServletRequest request) {
        if (bindingResult.hasErrors()) {
            Map<String, String> errors = new HashMap<>();
            bindingResult.getAllErrors().forEach(error -> errors.put(error.getDefaultMessage(), error.getDefaultMessage()));
            return ResponseEntity.badRequest().body(errors);
        }
        GroupDTO group = groupService.createGroup(groupDTO, request);
        return ResponseEntity.ok(group);
    }

    @PutMapping("update-status")
    public ResponseEntity<?> updateGroupStatus(@Valid @RequestBody
                                               Map<String, String> map,
                                               HttpServletRequest request) {
        try{
            Integer id = Integer.parseInt(map.get("id"));
            Boolean status = Boolean.parseBoolean(map.get("status"));
            GroupDTO group = groupService.updateStatus(id, status, request);
            return ResponseEntity.ok(group);
        }
        catch(Exception e){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    @DeleteMapping("delete/{id}")
    public ResponseEntity<?> deleteGroup(@PathVariable Integer id, HttpServletRequest request) {
        groupService.deleteGroup(id, request);
        return ResponseEntity.ok().build();
    }

    @GetMapping("get/by-user")
    public ResponseEntity<?> getGroupByUser(HttpServletRequest request) {
        List<GroupResponse> result = groupService.getByUser(request);
        return ResponseEntity.ok(result);
    }

    @GetMapping("get/all")
    public ResponseEntity<?> getAllGroups(String name, HttpServletRequest request) {
        List<GroupResponse> result = groupService.getAll(name, request);
        return ResponseEntity.ok(result);
    }
}
