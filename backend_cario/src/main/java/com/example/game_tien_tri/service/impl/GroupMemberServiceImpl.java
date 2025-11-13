package com.example.game_tien_tri.service.impl;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.example.game_tien_tri.service.GroupMemberService;
import com.example.game_tien_tri.repository.GroupMemberRepository;
import com.example.game_tien_tri.utils.ExtractUserUtils;
import com.example.game_tien_tri.convert.GroupMemberConvert;
import com.example.game_tien_tri.model.response.GroupMemberResponse;
import com.example.game_tien_tri.entity.UserEntity;
import com.example.game_tien_tri.entity.GroupMemberEntity;
import com.example.game_tien_tri.model.dto.UserGroupMember;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class GroupMemberServiceImpl implements GroupMemberService {
    private final GroupMemberRepository groupMemberRepository;
    private final GroupMemberConvert groupMemberConvert;
    private final ExtractUserUtils extractUserUtils;
    @Override
    public void joinGroup(Integer groupId, HttpServletRequest request) {
        UserEntity currentUser = extractUserUtils.extract(request);
        boolean isJoin = groupMemberRepository.existsByGroupIdAndUserId(groupId, currentUser.getId());
        if(!isJoin) {
            GroupMemberEntity groupMemberEntity = groupMemberConvert.toGroupMemberEntity(groupId, currentUser.getId());
            groupMemberEntity.setRole("member");
            groupMemberRepository.save(groupMemberEntity);
        }
    }

    @Override
    public void updateRole(Integer groupId, Integer userId, String role, HttpServletRequest request) {
        UserEntity user = extractUserUtils.extract(request);
        try{
            GroupMemberEntity grm1 = groupMemberRepository.findByGroupIdAndUserId(groupId, userId).orElse(null);
            if(grm1 != null) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Not found");
            }
            GroupMemberEntity grm2 = groupMemberRepository.findByGroupIdAndUserId(groupId, user.getId()).orElse(null);
            if(grm2 != null) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Not found");
            }
            if(grm2.getRole().equals("admin") && (!grm1.getRole().equals("admin"))) {
                grm1.setRole(role);
            }
            else{
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "User is not authorized update role");
            }
        }catch(Exception e){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }


    @Override
    public void deleteGroup(Integer groupId, Integer userId, HttpServletRequest request) {
        UserEntity user = extractUserUtils.extract(request);
        try{
            GroupMemberEntity grm1 = groupMemberRepository.findByGroupIdAndUserId(groupId, userId).orElse(null);
            if(grm1 != null) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Not found");
            }
            GroupMemberEntity grm2 = groupMemberRepository.findByGroupIdAndUserId(groupId, user.getId()).orElse(null);
            if(grm2 != null) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Not found");
            }
            if(grm2.getRole().equals("admin") && (!grm1.getRole().equals("admin"))) {
                groupMemberRepository.delete(grm1);
            }
            else if(grm2.getRole().equals("moderator") && (grm1.getRole().equals("member"))) {
                groupMemberRepository.delete(grm1);
            }
            else{
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "User is not authorized delete user");
            }
        }catch(Exception e){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    @Override
    public List<GroupMemberResponse> getGroupMembers(Integer groupId, HttpServletRequest request) {
        UserEntity currentUser = extractUserUtils.extract(request);
        GroupMemberEntity grm1 = groupMemberRepository.findByGroupIdAndUserId(groupId, currentUser.getId()).orElse(null);
        if(grm1 == null || !grm1.getRole().equals("admin")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "User is not authorized view group member");
        }
        try{
            List<GroupMemberEntity> list = groupMemberRepository.findByGroupId(groupId);
            List<GroupMemberResponse> responseList = new ArrayList<>();
            for(GroupMemberEntity grm : list) {
                GroupMemberResponse grmResponse = new GroupMemberResponse();
                UserEntity user = grm.getUser();
                UserGroupMember us = new UserGroupMember(user.getId(), user.getUsername(), user.getUrlAvatar());
                grmResponse.setGroupMember(us);
                grmResponse.setStatus(grm.getStatus());
                grmResponse.setJoinAt(grm.getJoinedAt());
                responseList.add(grmResponse);
            }
            return responseList;
        }catch(Exception e){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }
}
