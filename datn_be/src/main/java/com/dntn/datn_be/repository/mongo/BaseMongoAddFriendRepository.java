package com.dntn.datn_be.repository.mongo;

import com.dntn.datn_be.model.mongo.BaseMongoAddFriend;
import com.dntn.datn_be.model.mongo.BaseMongoMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BaseMongoAddFriendRepository extends MongoRepository<BaseMongoAddFriend,String> {
    BaseMongoAddFriend findByUserAddAndUserReceiver(Integer userAdd, Integer userReceiver);
}
