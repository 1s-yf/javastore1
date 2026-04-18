package com.cy.store.controller;

import com.cy.store.controller.dto.OrderCreateRequest;
import com.cy.store.entity.Order;
import com.cy.store.service.IOrderService;
import com.cy.store.util.JsonResult;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpSession;
import java.util.List;

@RestController
@RequestMapping("orders")
public class OrderController extends BaseController {
    @Autowired
    private IOrderService orderService;

    @RequestMapping("create")
    public JsonResult<Order> create(@RequestBody OrderCreateRequest request, HttpSession session) {
        Integer uid = getuidFromSession(session);
        String username = getUsernameFromSession(session);
        Order order = orderService.createPaidOrder(uid, username, request);
        return new JsonResult<>(Ok, order);
    }

    @RequestMapping({"/", ""})
    public JsonResult<List<Order>> getByUid(HttpSession session) {
        Integer uid = getuidFromSession(session);
        List<Order> list = orderService.getByUid(uid);
        return new JsonResult<>(Ok, list);
    }

    @RequestMapping("confirmReceive")
    public JsonResult<Void> confirmReceive(Integer oid) {
        orderService.confirmReceive(oid);
        return new JsonResult<>(Ok);
    }

    @RequestMapping("applyAfterSale")
    public JsonResult<Void> applyAfterSale(Integer oid) {
        orderService.applyAfterSale(oid);
        return new JsonResult<>(Ok);
    }

    @RequestMapping("getById")
    public JsonResult<Order> getById(Integer oid, HttpSession session) {
        Integer uid = getuidFromSession(session);
        Order order = orderService.getById(oid, uid);
        return new JsonResult<>(Ok, order);
    }
}