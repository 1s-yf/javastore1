package com.cy.store.mapper;

import com.cy.store.entity.Order;

import java.util.List;

public interface OrderMapper {
    Integer insert(Order order);

    List<Order> findByUid(Integer uid);
}
