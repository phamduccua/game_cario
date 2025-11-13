package com.example.game_tien_tri.service;

import jakarta.servlet.http.HttpServletRequest;
import com.example.game_tien_tri.model.response.GroupMemberResponse;
import java.util.List;

public interface GroupMemberService {
    void joinGroup(Integer groupId, HttpServletRequest request);
    void updateRole(Integer groupId, Integer userId, String role, HttpServletRequest request);
    void deleteGroup(Integer groupId, Integer userId, HttpServletRequest request);
    List<GroupMemberResponse> getGroupMembers(Integer groupId, HttpServletRequest request);
}
