package com.dntn.datn_be.repository.mongo;

import com.dntn.datn_be.model.mongo.BaseMongoAddFriend;
import com.dntn.datn_be.model.mongo.BaseMongoGroud;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface BaseMongoGroudRepository extends MongoRepository<BaseMongoGroud,String> {
}
