package com.cy.store.mapper;

import com.cy.store.entity.OrderItem;

import java.util.List;

public interface OrderItemMapper {
    Integer insert(OrderItem item);

    List<OrderItem> findByOid(Integer oid);
}
