package com.example.game_tien_tri.repository.custom.Impl;

import com.example.game_tien_tri.entity.PostEntity;
import com.example.game_tien_tri.model.request.PostGroupRequest;
import com.example.game_tien_tri.model.request.PostManagerResquest;
import com.example.game_tien_tri.model.request.PostRequest;
import com.example.game_tien_tri.repository.custom.PostRepositoryCustom;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Repository;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Repository
@Transactional
public class PostRepositoryImpl implements PostRepositoryCustom {
    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public List<PostEntity> getAllPosts(PostRequest postRequest) {
        StringBuilder sql = new StringBuilder();
        sql.append("select * from posts p \n");
        sql.append("where status = 1 AND type = 'forum' ");
        if(postRequest.getTitle()!=null && !postRequest.getTitle().equals("")){
            sql.append(" and  title like '%").append(postRequest.getTitle()).append("%' \n");
        }
        if(postRequest.getSort()!=null && postRequest.getSort().length()>0){
            if(postRequest.getSort().equals("time")){
                sql.append(" order by post_id ");
            }
            else if(postRequest.getSort().equals("like")){
                sql.append(" order by " + sortLike());
            }
            else{
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Data is not valid");
            }
        }
        else{
            sql.append(" order by post_id ");
        }
        if(postRequest.getTypeSort() == null || postRequest.getTypeSort().equals("")){
            sql.append(" desc");
        }
        else{
            if(!postRequest.getTypeSort().equals("desc") && !postRequest.getTypeSort().equals("asc")){
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Data is not valid");
            }
            sql.append(" " + postRequest.getTypeSort());
        }
        Query query = entityManager.createNativeQuery(sql.toString(), PostEntity.class);
        return query.getResultList();
    }

    public List<PostEntity> getPostsGroup(PostGroupRequest postGroupRequest) {
        StringBuilder sql = new StringBuilder();
        sql.append("select * from posts p \n");
        sql.append("where status = 1 and p.type = 'blog' and group_id = " + postGroupRequest.getGroupId() + " ");
        if(postGroupRequest.getSort()!=null && postGroupRequest.getSort().length()>0){
            if(postGroupRequest.getSort().equals("time")){
                sql.append(" order by post_id ");
            }
            else if(postGroupRequest.getSort().equals("like")){
                sql.append(" order by " + sortLike());
            }
            else{
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Data is not valid");
            }
        }
        else{
            sql.append(" order by post_id ");
        }
        if(postGroupRequest.getTypeSort() == null || postGroupRequest.getTypeSort().equals("")){
            sql.append(" desc");
        }
        else{
            if(!postGroupRequest.getTypeSort().equals("desc") || !postGroupRequest.getTypeSort().equals("asc")){
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Data is not valid");
            }
            sql.append(" " + postGroupRequest.getTypeSort());
        }
        Query query = entityManager.createNativeQuery(sql.toString(), PostEntity.class);
        return query.getResultList();
    }

    public List<PostEntity> getAll(PostManagerResquest postManagerResquest) {
        StringBuilder sql = new StringBuilder();
        sql.append("select p.post_id, p.user_id, p.group_id, p.title, p.content, p.type, p.created_at, p.updated_at, p.status \n" +
                "from posts p \n");
        sql.append("join users u on u.user_id = p.user_id \n");
        sql.append("where 1 = 1 and ");
        Map<String, String> mp = new HashMap<>();
        mp.put("title", postManagerResquest.getTitle());
        mp.put("u.username", postManagerResquest.getUsernameByPost());
        String sql_tmp = mp.entrySet().stream()
                .filter(e -> e.getValue() != null)
                .map(e -> e.getKey() + " like '%" + e.getValue() + "%'")
                .collect(Collectors.joining(" and "));
        sql.append(sql_tmp);
        if(postManagerResquest.getStatus() != null){
            sql.append(" and p.status = " + postManagerResquest.getStatus());
        }
        sql.append(" order by p.post_id desc");
        Query query = entityManager.createNativeQuery(sql.toString(), PostEntity.class);
        return query.getResultList();
    }


    private String sortLike(){
        StringBuilder sql = new StringBuilder();
        sql.append(" ( select count(l.like_id) from likes l\n" +
                "    where l.post_id = p.post_id ) ");
        return sql.toString();
    }

}
