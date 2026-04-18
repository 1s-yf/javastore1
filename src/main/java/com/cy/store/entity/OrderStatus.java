package com.cy.store.entity;

public class OrderStatus {
    public static final String getText(Integer status) {
        if (status == null) return "未知状态";
        switch (status) {
            case 0: return "待支付";
            case 1: return "待发货";
            case 2: return "待收货";
            case 3: return "交易完成";
            case 4: return "已取消";
            case 5: return "售后中";
            default: return "未知状态";
        }
    }
}