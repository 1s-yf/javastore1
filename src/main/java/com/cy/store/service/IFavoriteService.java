package com.cy.store.service;

import com.cy.store.entity.Favorite;
import java.util.List;

public interface IFavoriteService {
    void addFavorite(Integer uid, Integer pid);
    List<Favorite> getMyFavorite(Integer uid);
    void deleteFavorite(Integer fid);
}