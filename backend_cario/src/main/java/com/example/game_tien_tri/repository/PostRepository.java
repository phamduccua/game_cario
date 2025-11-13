package com.example.game_tien_tri.repository;

import com.example.game_tien_tri.entity.PostEntity;
import com.example.game_tien_tri.repository.custom.PostRepositoryCustom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<PostEntity, Integer>, PostRepositoryCustom {
    boolean existsById(Integer id);
    @Query("SELECT p FROM PostEntity p WHERE p.user.id = :userId ORDER BY p.id desc")
    List<PostEntity> findByUserId(@Param("userId")Integer userId);

    @Query("SELECT p FROM PostEntity p " +
            "WHERE 1=1 " +
            "AND (:groupId IS NULL OR p.group.id = :groupId) " +
            "AND (:status IS NULL OR p.status = :status)")
    List<PostEntity> findByGroupIdAndStatus(@Param("groupId") Integer groupId,
                                            @Param("status") Integer status);

}
