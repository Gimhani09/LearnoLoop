package com.example.demo.controller;

import com.example.demo.model.Like;
import com.example.demo.service.LikeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/likes")
public class LikeController {

    @Autowired
    private LikeService likeService;

    @GetMapping("/skill/{skillId}")
    public ResponseEntity<List<Like>> getLikesBySkillId(@PathVariable String skillId) {
        return new ResponseEntity<>(likeService.getLikesBySkillId(skillId), HttpStatus.OK);
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Like>> getLikesByUserId(@PathVariable String userId) {
        return new ResponseEntity<>(likeService.getLikesByUserId(userId), HttpStatus.OK);
    }
    
    @GetMapping("/count/{skillId}")
    public ResponseEntity<Map<String, Long>> countLikesBySkillId(@PathVariable String skillId) {
        Map<String, Long> response = new HashMap<>();
        response.put("count", likeService.countLikesBySkillId(skillId));
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
    
    @GetMapping("/check")
    public ResponseEntity<Map<String, Boolean>> hasUserLikedSkill(
            @RequestParam String skillId,
            @RequestParam String userId) {
        Map<String, Boolean> response = new HashMap<>();
        response.put("liked", likeService.hasUserLikedSkill(skillId, userId));
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PostMapping("/{skillId}/{userId}")
    public ResponseEntity<Like> addLike(
            @PathVariable String skillId,
            @PathVariable String userId) {
        return new ResponseEntity<>(likeService.addLike(skillId, userId), HttpStatus.CREATED);
    }

    @DeleteMapping("/{skillId}/{userId}")
    public ResponseEntity<Void> removeLike(
            @PathVariable String skillId,
            @PathVariable String userId) {
        boolean removed = likeService.removeLike(skillId, userId);
        if (removed) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }
}
