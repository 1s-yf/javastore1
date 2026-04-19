package com.cy.store.service;

import com.cy.store.controller.dto.OrderCreateRequest;
import com.cy.store.entity.Order;
import java.util.List;

public interface IOrderService {
    Order createPaidOrder(Integer uid, String username, OrderCreateRequest request);
    List<Order> getByUid(Integer uid);
    void confirmReceive(Integer oid);
    void applyAfterSale(Integer oid);
    void complete(Integer oid);
    Order getById(Integer oid, Integer uid);
}