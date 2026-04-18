package com.cy.store.mapper;

import com.cy.store.entity.Favorite;
import java.util.List;

public interface FavoriteMapper {
    int insert(Favorite favorite);
    List<Favorite> listByUid(Integer uid);
    int delete(Integer fid);
    Favorite findByUidAndPid(Integer uid, Integer pid);
}