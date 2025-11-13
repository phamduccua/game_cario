package com.example.game_tien_tri.convert;

import com.example.game_tien_tri.entity.GroupEntity;
import com.example.game_tien_tri.entity.GroupMemberEntity;
import com.example.game_tien_tri.entity.UserEntity;
import com.example.game_tien_tri.repository.GroupRepository;
import com.example.game_tien_tri.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class GroupMemberConvert {
    private final ModelMapper modelMapper;
    private final GroupRepository groupRepository;
    private final UserRepository userRepository;
    public GroupMemberEntity toGroupMemberEntity(Integer groupId, Integer userId) {
        GroupMemberEntity groupMemberEntity = new GroupMemberEntity();
        GroupEntity group = groupRepository.findById(groupId).get();
        UserEntity user = userRepository.findById(userId).get();
        groupMemberEntity.setGroup(group);
        groupMemberEntity.setUser(user);
        groupMemberEntity.setStatus(group.getIsPrivate() == false ? 1 : 0);;
        return groupMemberEntity;
    }
}
