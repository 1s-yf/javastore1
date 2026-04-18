package com.cy.store.controller;

import com.cy.store.service.IFavoriteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import javax.servlet.http.HttpSession;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/favorite")
public class FavoriteController {

    @Autowired
    private IFavoriteService favoriteService;

    @GetMapping("/add")
    public Map<String, Object> add(Integer pid, HttpSession session) {
        Integer uid = (Integer) session.getAttribute("uid");
        favoriteService.addFavorite(uid, pid);
        Map<String, Object> map = new HashMap<>();
        map.put("status", 200);
        map.put("msg", "收藏成功（已写入数据库 t_favorite）");
        return map;
    }

    @GetMapping("/list")
    public Map<String, Object> list(HttpSession session) {
        Integer uid = (Integer) session.getAttribute("uid");
        Map<String, Object> map = new HashMap<>();
        map.put("status", 200);
        map.put("data", favoriteService.getMyFavorite(uid));
        return map;
    }

    @GetMapping("/delete")
    public Map<String, Object> delete(Integer fid) {
        favoriteService.deleteFavorite(fid);
        Map<String, Object> map = new HashMap<>();
        map.put("status", 200);
        return map;
    }
}