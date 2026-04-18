package com.cy.store.controller;

import com.cy.store.service.ICartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import javax.servlet.http.HttpSession;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/cart")
public class CartController {

    @Autowired
    private ICartService cartService;

    // 改成 GET 就能浏览器访问了
    @GetMapping("/add")
    public Map<String, Object> add(Integer pid, Long price, Integer num, HttpSession session) {
        Integer uid = (Integer) session.getAttribute("uid");
        cartService.addCart(uid, pid, price, num);
        Map<String, Object> map = new HashMap<>();
        map.put("status", 200);
        map.put("msg","添加购物车成功（已写入数据库t_cart）");
        return map;
    }

    @GetMapping("/list")
    public Map<String, Object> list(HttpSession session) {
        Integer uid = (Integer) session.getAttribute("uid");
        Map<String, Object> map = new HashMap<>();
        map.put("status", 200);
        map.put("data", cartService.getMyCart(uid));
        return map;
    }

    @GetMapping("/updateNum")
    public Map<String, Object> updateNum(Integer cid, Integer step) {
        cartService.updateNum(cid, step);
        Map<String, Object> map = new HashMap<>();
        map.put("status", 200);
        return map;
    }

    @GetMapping("/delete")
    public Map<String, Object> delete(Integer cid) {
        cartService.deleteCart(cid);
        Map<String, Object> map = new HashMap<>();
        map.put("status", 200);
        return map;
    }
}