package com.example.game_tien_tri.repository;

import com.example.game_tien_tri.entity.LikeEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LikeRepository extends JpaRepository<LikeEntity, Integer> {
    LikeEntity findByUserIdAndPostId(Integer userId, Integer postId);
    LikeEntity findByUserIdAndCommentId(Integer userId, Integer likeId);
    boolean existsByUserIdAndPostId(Integer userId, Integer postId);
    boolean existsByUserIdAndCommentId(Integer userId, Integer likeId);
    Integer countByPostId(Integer postId);
    Integer countByUserIdAndCommentId(Integer userId, Integer likeId);
}
