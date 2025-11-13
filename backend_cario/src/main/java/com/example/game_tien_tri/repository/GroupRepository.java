package com.example.game_tien_tri.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.example.game_tien_tri.entity.GroupEntity;
import java.util.List;

@Repository
public interface GroupRepository extends JpaRepository<GroupEntity, Integer> {

    @Query("SELECT g FROM GroupEntity g " +
            "WHERE :name IS NULL OR g.name LIKE CONCAT('%', :name, '%')")
    List<GroupEntity> findByNameContaining(@Param("name") String name);
}
