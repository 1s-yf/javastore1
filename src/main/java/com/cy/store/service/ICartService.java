package com.cy.store.service;

import com.cy.store.entity.Cart;
import java.util.List;

public interface ICartService {
    void addCart(Integer uid, Integer pid, Long price, Integer num);
    List<Cart> getMyCart(Integer uid);
    void updateNum(Integer cid, Integer step);
    void deleteCart(Integer cid);
}