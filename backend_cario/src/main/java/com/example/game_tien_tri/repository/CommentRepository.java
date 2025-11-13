package com.example.game_tien_tri.repository;

import com.example.game_tien_tri.entity.CommentEntity;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<CommentEntity, Integer> {
    @Query("SELECT cm FROM CommentEntity cm WHERE cm.post.id = :postId AND cm.parent is null")
    List<CommentEntity> findByPostId(@Param("postId") Integer postId);
    Integer countByPostId(Integer postId);
}
