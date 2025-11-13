package com.example.game_tien_tri.convert;

import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;
import com.example.game_tien_tri.entity.GroupEntity;
import com.example.game_tien_tri.model.dto.GroupDTO;
import com.example.game_tien_tri.model.response.GroupResponse;
@Component
@RequiredArgsConstructor
public class GroupConvert {
    private final ModelMapper modelMapper;

    public GroupEntity toGroupEntity(GroupDTO groupDTO) {
        GroupEntity groupEntity = modelMapper.map(groupDTO, GroupEntity.class);
        if(groupDTO.getIsPrivate() == null){
            groupEntity.setIsPrivate(false);
        }
        return groupEntity;
    }

    public GroupResponse toGroupResponse(GroupEntity groupEntity) {
        GroupResponse groupResponse = modelMapper.map(groupEntity, GroupResponse.class);
        return groupResponse;
    }
}
