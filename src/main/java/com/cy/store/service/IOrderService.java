package com.cy.store.service;

import com.cy.store.controller.dto.OrderCreateRequest;
import com.cy.store.entity.Order;

import java.util.List;

public interface IOrderService {
    Order createPaidOrder(Integer uid, String username, OrderCreateRequest request);

    List<Order> getByUid(Integer uid);
}
