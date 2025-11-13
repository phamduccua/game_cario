package com.example.game_tien_tri.service.impl;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import com.example.game_tien_tri.service.GroupService;
import com.example.game_tien_tri.repository.GroupRepository;
import com.example.game_tien_tri.convert.GroupConvert;
import com.example.game_tien_tri.repository.GroupMemberRepository;
import com.example.game_tien_tri.repository.UserRepository;
import com.example.game_tien_tri.utils.ExtractUserUtils;
import com.example.game_tien_tri.model.dto.GroupDTO;
import com.example.game_tien_tri.model.response.GroupResponse;
import com.example.game_tien_tri.entity.UserEntity;
import com.example.game_tien_tri.entity.GroupEntity;
import com.example.game_tien_tri.entity.GroupMemberEntity;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class GroupServiceImpl implements GroupService {
    private final GroupRepository groupRepository;
    private final GroupConvert groupConvert;
    private final GroupMemberRepository groupMemberRepository;
    private final UserRepository userRepository;
    private final ExtractUserUtils extractUserUtils;
    @Override
    public GroupDTO createGroup(GroupDTO groupDTO, HttpServletRequest request) {
        UserEntity user = extractUserUtils.extract(request);
        try{
            groupDTO.setId(null);
            GroupEntity groupEntity = groupConvert.toGroupEntity(groupDTO);
            GroupEntity saved = groupRepository.save(groupEntity);
            GroupMemberEntity groupMemberEntity = new GroupMemberEntity();
            groupMemberEntity.setGroup(saved);
            groupMemberEntity.setStatus(1);
            groupMemberEntity.setRole("admin");
            groupMemberEntity.setUser(user);
            groupMemberRepository.save(groupMemberEntity);
            return new GroupDTO(saved.getId(), saved.getName(), saved.getDescription(), saved.getIsPrivate());
        }catch(Exception e){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    @Override
    public GroupDTO updateStatus(Integer id, Boolean status, HttpServletRequest request) {
        UserEntity user = extractUserUtils.extract(request);
        try{
            GroupEntity groupEntity = groupRepository.findById(id).orElseThrow(() -> new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Group not found"
            ));
            GroupMemberEntity groupMemberEntity = groupMemberRepository.findByGroupIdAndUserId(groupEntity.getId(), user.getId()).orElse(null);
            if(groupMemberEntity == null && !groupMemberEntity.getRole().equals("admin")){
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "User is not authorized to delete this group");
            }
            groupEntity.setIsPrivate(status);
            groupRepository.save(groupEntity);
            return new GroupDTO(groupEntity.getId(), groupEntity.getName(), groupEntity.getDescription(), groupEntity.getIsPrivate());
        }catch(Exception e){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    @Override
    public void deleteGroup(Integer id, HttpServletRequest request) {
        UserEntity user = extractUserUtils.extract(request);
        GroupMemberEntity groupMemberEntity = groupMemberRepository.findByGroupIdAndUserId(id, user.getId()).orElse(null);
        if(groupMemberEntity == null){
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Group not found");
        }
        if(!user.getRole().equals("admin") && !groupMemberEntity.getRole().equals("admin")){
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "User is not authorized to delete this group");
        }
        try{
            groupRepository.deleteById(id);
        }catch(Exception e){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    @Override
    public List<GroupResponse> getByUser(HttpServletRequest request) {
        UserEntity user = extractUserUtils.extract(request);
        try{
            List<GroupMemberEntity> list = groupMemberRepository.findByUserId(user.getId());
            List<GroupResponse> result = new ArrayList<>();
            for(GroupMemberEntity groupMemberEntity : list){
                GroupEntity groupEntity = groupRepository.findById(groupMemberEntity.getGroup().getId()).orElse(null);
                GroupResponse groupResponse = groupConvert.toGroupResponse(groupEntity);
                Integer countUserJoin = groupMemberRepository.countByGroupId(groupEntity.getId());
                groupResponse.setCountUserJoin(countUserJoin);
                groupResponse.setUserRole(groupMemberEntity.getRole());
                result.add(groupResponse);
            }
            return result;
        }catch(Exception e){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    @Override
    public List<GroupResponse> getAll(String name, HttpServletRequest request) {
        UserEntity user = extractUserUtils.extract(request);
        try{
            List<GroupResponse> result = new ArrayList<>();
            List<GroupEntity> list = groupRepository.findByNameContaining(name);
            for(GroupEntity groupEntity : list){
                GroupResponse groupResponse = groupConvert.toGroupResponse(groupEntity);
                GroupMemberEntity grmEntity = groupMemberRepository.findByGroupIdAndUserId(groupEntity.getId(), user.getId()).orElse(null);
                if(grmEntity == null){
                    groupResponse.setUserRole(null);
                }
                else{
                    groupResponse.setUserRole(grmEntity.getRole());
                }
                Integer countUserJoin = groupMemberRepository.countByGroupId(groupEntity.getId());
                groupResponse.setCountUserJoin(countUserJoin);
                result.add(groupResponse);
            }
            return result;
        }catch(Exception e){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }
}
