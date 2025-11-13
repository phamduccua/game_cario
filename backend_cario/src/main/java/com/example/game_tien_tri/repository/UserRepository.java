package com.example.game_tien_tri.repository;

import com.example.game_tien_tri.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<UserEntity, Integer> {
    Optional<UserEntity> findByUsernameAndStatus(String username,Integer status);
    Optional<UserEntity> findByUsername(String username);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    @Query("SELECT u FROM UserEntity u WHERE u.role = 'admin' or u.role = 'moderator'")
    List<UserEntity> findByAdmins();

    @Query("SELECT u FROM UserEntity u " +
            "JOIN u.groupMembers gm " +
            "WHERE gm.group.id = :groupId AND gm.role = 'admin'")
    List<UserEntity> findAdminsByGroupId(@Param("groupId") Integer groupId);
}
