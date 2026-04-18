package com.cy.store.service.impl;

import com.cy.store.entity.Cart;
import com.cy.store.mapper.CartMapper;
import com.cy.store.service.ICartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CartServiceImpl implements ICartService {

    @Autowired
    private CartMapper cartMapper;

    @Override
    public void addCart(Integer uid, Integer pid, Long price, Integer num) {
        Cart cart = new Cart();
        cart.setUid(uid);
        cart.setPid(pid);
        cart.setPrice(price);
        cart.setNum(num);
        cartMapper.insert(cart);
    }

    @Override
    public List<Cart> getMyCart(Integer uid) {
        return cartMapper.listByUid(uid);
    }

    @Override
    public void updateNum(Integer cid, Integer step) {
        Cart cart = cartMapper.findByCid(cid);
        int newNum = cart.getNum() + step;

        if (newNum <= 0) {
            cartMapper.delete(cid);
            return;
        }
        cartMapper.updateNum(cid, newNum);
    }

    @Override
    public void deleteCart(Integer cid) {
        cartMapper.delete(cid);
    }
}