package com.example.game_tien_tri.service.impl;

import com.example.game_tien_tri.convert.PostConvert;
import com.example.game_tien_tri.entity.GroupEntity;
import com.example.game_tien_tri.entity.GroupMemberEntity;
import com.example.game_tien_tri.entity.PostEntity;
import com.example.game_tien_tri.entity.UserEntity;
import com.example.game_tien_tri.model.dto.GroupOfPostDTO;
import com.example.game_tien_tri.model.dto.PostDTO;
import com.example.game_tien_tri.model.dto.UserOfPost;
import com.example.game_tien_tri.model.request.PostGroupRequest;
import com.example.game_tien_tri.model.request.PostManagerResquest;
import com.example.game_tien_tri.model.response.PostManagerResponse;
import com.example.game_tien_tri.model.request.PostRequest;
import com.example.game_tien_tri.model.response.PostResponse;
import com.example.game_tien_tri.repository.*;
import com.example.game_tien_tri.service.PostService;
import com.example.game_tien_tri.utils.ExtractUserUtils;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class PostServiceImpl implements PostService {
    private final PostRepository postRepository;
    private final PostConvert postConvert;
    private final ExtractUserUtils extractUserUtils;
    private final GroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final LikeRepository likeRepository;
    private final CommentRepository commentRepository;
    private final UserRepository userRepository;

    @Override
    public PostDTO createPost(PostDTO postDTO, HttpServletRequest httpRequest) {
        try{
            UserEntity user = extractUserUtils.extract(httpRequest);
            postDTO.setId(null);
            postDTO.setStatus(null);
            PostEntity postEntity = postConvert.toPostEntity(postDTO);
            postEntity.setUser(user);
            PostEntity post = postRepository.save(postEntity);
            return new PostDTO(post.getId(), post.getTitle(), post.getContent(), post.getType(), post.getStatus(), postDTO.getGroupId());
        }catch(Exception e){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Data is not valid");
        }
    }
    @Override
    public PostDTO updatePost(PostDTO postDTO, HttpServletRequest httpRequest) {
        UserEntity user = extractUserUtils.extract(httpRequest);
        PostEntity post = postRepository.findById(postDTO.getId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Post Not Found"
                ));
        if(!user.getRole().equals("admin") && !Objects.equals(user.getId(), post.getUser().getId())){
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "User is not authorized to update this post");
        }
        post.setTitle(postDTO.getTitle());
        post.setContent(postDTO.getContent());
        PostEntity saved = postRepository.save(post);
        return new PostDTO(saved.getId(), saved.getTitle(), saved.getContent(), saved.getType(), saved.getStatus(), postDTO.getGroupId());
    }

    @Override
    public void deletePost(Integer postId, HttpServletRequest httpRequest) {
        UserEntity user = extractUserUtils.extract(httpRequest);
        if(!postRepository.existsById(postId)){
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Post Not Found");
        }
        PostEntity post = postRepository.findById(postId).get();
        if(!user.getRole().equals("admin") && !Objects.equals(user.getId(), post.getUser().getId())){
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "User is not authorized to delete this post");
        }
        postRepository.deleteById(postId);
    }

    @Override
    public PostDTO updateStatus(Integer id, Integer status,HttpServletRequest httpRequest) {
        UserEntity user = extractUserUtils.extract(httpRequest);
        try {
            PostEntity postEntity = postRepository.findById(id)
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND,
                            "Post Not Found"
                    ));
            if(postEntity.getType().equals("forum")){
                if(user.getRole().equals("admin") || user.getRole().equals("moderator")){
                    postEntity.setStatus(status);
                    PostEntity saved = postRepository.save(postEntity);
                    return new PostDTO(id, saved.getTitle(), saved.getContent(), postEntity.getType(), postEntity.getStatus(), postEntity.getGroup() == null ? null : postEntity.getGroup().getId());
                }
                else{
                    throw new ResponseStatusException(HttpStatus.FORBIDDEN, "User is not authorized to update this post");
                }
            }
            else{
                GroupMemberEntity groupMemberEntity = groupMemberRepository.findByGroupIdAndUserId(postEntity.getGroup().getId(), user.getId()).orElse(null);
                if(groupMemberEntity == null || groupMemberEntity.getRole().equals("member")){
                    throw new ResponseStatusException(HttpStatus.FORBIDDEN, "User is not authorized to update this post");
                }
                else{
                    postEntity.setStatus(status);
                    postRepository.save(postEntity);
                    return new PostDTO(id, postEntity.getTitle(), postEntity.getContent(), postEntity.getType(), postEntity.getStatus(), postEntity.getGroup().getId());
                }
            }

        }catch(Exception e){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }

    }

    @Override
    public List<PostResponse> getPost(PostRequest postRequest, HttpServletRequest httpRequest) {
        UserEntity user = extractUserUtils.extract(httpRequest);
        try{
            List<PostResponse> result = new ArrayList<>();
            List<PostEntity> list = postRepository.getAllPosts(postRequest);
            for(PostEntity postEntity : list){
                PostResponse postResponse = postConvert.toPostResponse(postEntity);
                UserEntity userPost = postEntity.getUser();
                UserOfPost us = new UserOfPost();
                us.setUsername(userPost.getUsername());
                us.setUrlAvatar(userPost.getUrlAvatar());
                postResponse.setUserOfPost(us);
                Integer countLike = likeRepository.countByPostId(postEntity.getId());
                postResponse.setCountLike(countLike);
                boolean isLike = likeRepository.existsByUserIdAndPostId(user.getId(), postEntity.getId());
                postResponse.setUserIsLike(isLike);
                Integer countComment = commentRepository.countByPostId(postEntity.getId());
                postResponse.setCountComment(countComment);
                result.add(postResponse);
            }
            return result;
        }catch(Exception e){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    @Override
    public List<PostResponse> getByGoup(PostGroupRequest postGroupRequest, HttpServletRequest httpRequest) {
        UserEntity user = extractUserUtils.extract(httpRequest);
        try{
            List<PostResponse> result = new ArrayList<>();
            List<PostEntity> list = postRepository.getPostsGroup(postGroupRequest);
            for(PostEntity postEntity : list){
                PostResponse postResponse = postConvert.toPostResponse(postEntity);
                UserEntity userPost = postEntity.getUser();
                UserOfPost us = new UserOfPost();
                us.setUsername(userPost.getUsername());
                us.setUrlAvatar(userPost.getUrlAvatar());
                postResponse.setUserOfPost(us);
                Integer countLike = likeRepository.countByPostId(postEntity.getId());
                postResponse.setCountLike(countLike);
                boolean isLike = likeRepository.existsByUserIdAndPostId(user.getId(), postEntity.getId());
                postResponse.setUserIsLike(isLike);
                Integer countComment = commentRepository.countByPostId(postEntity.getId());
                postResponse.setCountComment(countComment);
                result.add(postResponse);
            }
            return result;
        }catch(Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    @Override
    public List<PostResponse> getByUser(HttpServletRequest httpRequest) {
        UserEntity user = extractUserUtils.extract(httpRequest);
        try{
            List<PostResponse> result = new ArrayList<>();
            List<PostEntity> list = postRepository.findByUserId(user.getId());
            for(PostEntity postEntity : list){
                PostResponse postResponse = postConvert.toPostResponse(postEntity);
                UserEntity userPost = postEntity.getUser();
                UserOfPost us = new UserOfPost();
                us.setUsername(userPost.getUsername());
                us.setUrlAvatar(userPost.getUrlAvatar());
                postResponse.setUserOfPost(us);
                Integer countLike = likeRepository.countByPostId(postEntity.getId());
                postResponse.setCountLike(countLike);
                boolean isLike = likeRepository.existsByUserIdAndPostId(user.getId(), postEntity.getId());
                postResponse.setUserIsLike(isLike);
                Integer countComment = commentRepository.countByPostId(postEntity.getId());
                postResponse.setCountComment(countComment);
                result.add(postResponse);
            }
            return result;
        }catch(Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    @Override
    public List<PostManagerResponse> getAll(PostManagerResquest postManagerResquest, HttpServletRequest request) {
        UserEntity userEntity = extractUserUtils.extract(request);
        if(!userEntity.getRole().equals("admin")){
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "User is not authorized to get this posts");
        }
        try{
            List<PostManagerResponse> result = new ArrayList<>();
            List<PostEntity> list = postRepository.getAll(postManagerResquest);
            for(PostEntity postEntity : list){
                PostManagerResponse postManagerResponse = postConvert.postManagerResponse(postEntity);
                UserEntity user = postEntity.getUser();
                UserOfPost us = new UserOfPost();
                us.setUsername(user.getUsername());
                us.setUrlAvatar(user.getUrlAvatar());
                postManagerResponse.setUserOfPost(us);
                GroupEntity group = postEntity.getGroup();
                if(group != null) {
                    GroupOfPostDTO groupOfPostDTO = new GroupOfPostDTO();
                    groupOfPostDTO.setId(group.getId());
                    groupOfPostDTO.setName(group.getName());
                    postManagerResponse.setGroupOfPost(groupOfPostDTO);
                }
                result.add(postManagerResponse);
            }
            return result;
        }catch(Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    @Override
    public List<PostManagerResponse> getAllByGroup(Integer id, Integer status, HttpServletRequest httpRequest) {
        UserEntity userEntity =  extractUserUtils.extract(httpRequest);
        GroupMemberEntity groupMemberEntity = groupMemberRepository.findByGroupIdAndUserId(id, userEntity.getId()).orElse(null);
        if(groupMemberEntity == null){
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "The user does not exist in the group.");
        }
        else if(!groupMemberEntity.getRole().equals("admin")){
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "User is not authorized to get this posts");
        }

        try{
            List<PostManagerResponse> result = new ArrayList<>();
            List<PostEntity> list = postRepository.findByGroupIdAndStatus(id,status);
            for(PostEntity postEntity : list) {
                PostManagerResponse postManagerResponse = postConvert.postManagerResponse(postEntity);
                UserEntity user = postEntity.getUser();
                UserOfPost us = new UserOfPost();
                us.setUsername(user.getUsername());
                us.setUrlAvatar(user.getUrlAvatar());
                postManagerResponse.setUserOfPost(us);
                GroupEntity group = postEntity.getGroup();
                if (group != null) {
                    GroupOfPostDTO groupOfPostDTO = new GroupOfPostDTO();
                    groupOfPostDTO.setId(group.getId());
                    groupOfPostDTO.setName(group.getName());
                    postManagerResponse.setGroupOfPost(groupOfPostDTO);
                }
                result.add(postManagerResponse);
            }
            return result;
        }catch(Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    @Override
    public PostResponse getById(Integer id, HttpServletRequest request) {
        UserEntity user = extractUserUtils.extract(request);
        try{
            PostEntity postEntity = postRepository.findById(id).get();
            PostResponse postResponse = postConvert.toPostResponse(postEntity);
            UserEntity userPost = postEntity.getUser();
            UserOfPost us = new UserOfPost();
            us.setUsername(userPost.getUsername());
            us.setUrlAvatar(userPost.getUrlAvatar());
            postResponse.setUserOfPost(us);
            Integer countLike = likeRepository.countByPostId(postEntity.getId());
            postResponse.setCountLike(countLike);
            boolean isLike = likeRepository.existsByUserIdAndPostId(user.getId(), postEntity.getId());
            postResponse.setUserIsLike(isLike);
            Integer countComment = commentRepository.countByPostId(postEntity.getId());
            postResponse.setCountComment(countComment);
            return postResponse;
        }catch(Exception e){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }
}
