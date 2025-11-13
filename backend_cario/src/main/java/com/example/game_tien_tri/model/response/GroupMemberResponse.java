package com.example.game_tien_tri.model.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import com.example.game_tien_tri.model.dto.UserGroupMember;
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class GroupMemberResponse {
    private UserGroupMember groupMember;
    private LocalDateTime joinAt;
    private Integer status;
    private String userRole;
}
