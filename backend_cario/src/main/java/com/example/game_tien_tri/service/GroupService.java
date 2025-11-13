package com.example.game_tien_tri.service;

import jakarta.servlet.http.HttpServletRequest;
import com.example.game_tien_tri.model.dto.GroupDTO;
import com.example.game_tien_tri.model.response.GroupResponse;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;

public interface GroupService {
    GroupDTO createGroup(GroupDTO groupDTO, HttpServletRequest request);
    GroupDTO updateStatus(Integer id, Boolean status, HttpServletRequest request);
    void deleteGroup(Integer id, HttpServletRequest request);
    List<GroupResponse> getByUser(HttpServletRequest request);
    List<GroupResponse> getAll(String name, HttpServletRequest request);
}
