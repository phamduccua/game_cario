package com.example.game_tien_tri.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.example.game_tien_tri.entity.GroupMemberEntity;
import java.util.List;
import java.util.Optional;

@Repository
public interface GroupMemberRepository extends JpaRepository<GroupMemberEntity, Integer> {
    Optional<GroupMemberEntity> findByGroupIdAndUserId(Integer groupId, Integer memberId);
    List<GroupMemberEntity> findByUserId(Integer userId);
    Integer countByGroupId(Integer groupId);
    List<GroupMemberEntity> findByGroupId(Integer groupId);
    boolean existsByGroupIdAndUserId(Integer groupId, Integer userId);
}