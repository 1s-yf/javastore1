package com.cy.store.service.impl;

import com.cy.store.controller.dto.OrderCreateRequest;
import com.cy.store.entity.Address;
import com.cy.store.entity.Order;
import com.cy.store.entity.OrderItem;
import com.cy.store.mapper.AddressMapper;
import com.cy.store.mapper.OrderItemMapper;
import com.cy.store.mapper.OrderMapper;
import com.cy.store.service.IOrderService;
import com.cy.store.service.ex.AccessDeniedException;
import com.cy.store.service.ex.AddressNotFoundException;
import com.cy.store.service.ex.InsertException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Service
public class OrderServiceImpl implements IOrderService {
    @Autowired
    private OrderMapper orderMapper;

    @Autowired
    private OrderItemMapper orderItemMapper;

    @Autowired
    private AddressMapper addressMapper;

    @Transactional
    @Override
    public Order createPaidOrder(Integer uid, String username, OrderCreateRequest request) {
        if (request == null || request.getAid() == null) {
            throw new InsertException("创建订单失败：未选择收货地址");
        }

        Address address = addressMapper.findByAid(request.getAid());
        if (address == null) {
            throw new AddressNotFoundException("收货地址不存在");
        }
        if (!uid.equals(address.getUid())) {
            throw new AccessDeniedException("非法访问");
        }

        List<OrderCreateRequest.OrderItemRequest> reqItems = request.getItems();
        if (reqItems == null) {
            reqItems = new ArrayList<>();
        }

        long computedTotal = 0L;
        for (OrderCreateRequest.OrderItemRequest item : reqItems) {
            if (item == null) {
                continue;
            }
            Long price = item.getPrice() == null ? 0L : item.getPrice();
            Integer num = item.getNum() == null ? 0 : item.getNum();
            computedTotal += price * num;
        }

        Long totalPrice = request.getTotalPrice();
        if (totalPrice == null || totalPrice <= 0) {
            totalPrice = computedTotal;
        }

        Date now = new Date();

        Order order = new Order();
        order.setUid(uid);
        order.setRecvName(address.getName());
        order.setRecvPhone(address.getPhone());
        order.setRecvProvince(address.getProvinceName());
        order.setRecvCity(address.getCityName());
        order.setRecvArea(address.getAreaName());
        order.setRecvAddress(address.getAddress());
        order.setTotalPrice(totalPrice);
        order.setStatus(1);
        order.setOrderTime(now);
        order.setPayTime(now);
        order.setCreatedUser(username);
        order.setCreatedTime(now);
        order.setModifiedUser(username);
        order.setModifiedTime(now);

        Integer rows = orderMapper.insert(order);
        if (rows != 1) {
            throw new InsertException("创建订单失败");
        }

        Integer oid = order.getOid();
        List<OrderItem> items = new ArrayList<>();
        for (OrderCreateRequest.OrderItemRequest item : reqItems) {
            if (item == null) {
                continue;
            }
            OrderItem orderItem = new OrderItem();
            orderItem.setOid(oid);
            orderItem.setPid(item.getPid() == null ? 0 : item.getPid());
            orderItem.setTitle(item.getTitle());
            orderItem.setImage(item.getImage());
            orderItem.setPrice(item.getPrice());
            orderItem.setNum(item.getNum());
            orderItem.setCreatedUser(username);
            orderItem.setCreatedTime(now);
            orderItem.setModifiedUser(username);
            orderItem.setModifiedTime(now);

            rows = orderItemMapper.insert(orderItem);
            if (rows != 1) {
                throw new InsertException("创建订单商品失败");
            }
            items.add(orderItem);
        }

        order.setItems(items);
        order.setUid(null);
        return order;
    }

    @Override
    public List<Order> getByUid(Integer uid) {
        List<Order> list = orderMapper.findByUid(uid);
        if (list == null) {
            return new ArrayList<>();
        }
        for (Order order : list) {
            if (order == null) {
                continue;
            }
            List<OrderItem> items = orderItemMapper.findByOid(order.getOid());
            order.setItems(items);
            order.setUid(null);
        }
        return list;
    }
}
