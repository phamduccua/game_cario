package com.example.game_tien_tri.controller;

import com.example.game_tien_tri.model.response.GroupMemberResponse;
import com.example.game_tien_tri.service.GroupMemberService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/group-member/")
public class GroupMemberController {
    private final GroupMemberService groupMemberService;

    @PostMapping("join/{id}")
    public ResponseEntity<String> join(@PathVariable Integer id, HttpServletRequest request) {
        groupMemberService.joinGroup(id, request);
        return ResponseEntity.ok().build();
    }

    @PutMapping("update/role")
    public ResponseEntity<?> updateRole(@RequestBody
                                        Map<String, String> map,
                                        HttpServletRequest request) {
        try{
            Integer groupId = Integer.parseInt(map.get("groupId"));
            Integer userId = Integer.parseInt(map.get("userId"));
            String role = map.get("role");
            groupMemberService.updateRole(groupId, userId, role, request);
            return ResponseEntity.ok().build();
        }catch (Exception e){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Data is not valid");
        }
    }
    @DeleteMapping("delete")
    public ResponseEntity<String> delete(@RequestBody
                                         Map<String, String> map,
                                         HttpServletRequest request) {
        try{
            Integer groupId = Integer.parseInt(map.get("id"));
            Integer userId = Integer.parseInt(map.get("userId"));
            groupMemberService.deleteGroup(groupId, userId, request);
            return ResponseEntity.ok().build();
        }catch(Exception e){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Data is not valid");
        }
    }

    @GetMapping("get/by-group")
    public ResponseEntity<?> getByGroup(@RequestParam(required = true) Integer groupId,
                                        HttpServletRequest request) {
        List<GroupMemberResponse> result = groupMemberService.getGroupMembers(groupId, request);
        return ResponseEntity.ok(result);
    }
}
