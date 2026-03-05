package com.dntn.datn_be.repository.mongo;

import com.dntn.datn_be.model.mongo.BaseMongoMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BaseMongoMessageRepository extends MongoRepository<BaseMongoMessage,String> {
    List<BaseMongoMessage> findByGroudId(String groudId);
}
