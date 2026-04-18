package com.cy.store.service.impl;

import com.cy.store.entity.Favorite;
import com.cy.store.mapper.FavoriteMapper;
import com.cy.store.service.IFavoriteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FavoriteServiceImpl implements IFavoriteService {

    @Autowired
    private FavoriteMapper favoriteMapper;

    @Override
    public void addFavorite(Integer uid, Integer pid) {
        Favorite fav = new Favorite();
        fav.setUid(uid);
        fav.setPid(pid);
        favoriteMapper.insert(fav);
    }

    @Override
    public List<Favorite> getMyFavorite(Integer uid) {
        return favoriteMapper.listByUid(uid);
    }

    @Override
    public void deleteFavorite(Integer fid) {
        favoriteMapper.delete(fid);
    }
}