package com.cy.store.controller.dto;

import java.util.List;

public class OrderCreateRequest {
    private Integer aid;
    private Long totalPrice;
    private List<OrderItemRequest> items;

    public Integer getAid() {
        return aid;
    }

    public void setAid(Integer aid) {
        this.aid = aid;
    }

    public Long getTotalPrice() {
        return totalPrice;
    }

    public void setTotalPrice(Long totalPrice) {
        this.totalPrice = totalPrice;
    }

    public List<OrderItemRequest> getItems() {
        return items;
    }

    public void setItems(List<OrderItemRequest> items) {
        this.items = items;
    }

    public static class OrderItemRequest {
        private Integer pid;
        private String title;
        private String image;
        private Long price;
        private Integer num;

        public Integer getPid() {
            return pid;
        }

        public void setPid(Integer pid) {
            this.pid = pid;
        }

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public String getImage() {
            return image;
        }

        public void setImage(String image) {
            this.image = image;
        }

        public Long getPrice() {
            return price;
        }

        public void setPrice(Long price) {
            this.price = price;
        }

        public Integer getNum() {
            return num;
        }

        public void setNum(Integer num) {
            this.num = num;
        }
    }
}
