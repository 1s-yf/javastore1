package com.cy.store.mapper;

import com.cy.store.entity.Cart;
import org.apache.ibatis.annotations.Param;
import java.util.List;

public interface CartMapper {
    int insert(Cart cart);
    List<Cart> listByUid(Integer uid);
    int updateNum(@Param("cid") Integer cid, @Param("num") Integer num);
    int delete(Integer cid);
    Cart findByCid(Integer cid);
}