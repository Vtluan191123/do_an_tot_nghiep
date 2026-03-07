package com.dntn.datn_be.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;

public class SendMessageWebSocketRequest {

    @JsonProperty(value = "topic")
    private String topic;
    private String clientId;
    private String content;

    public String getTopic() {
        return topic;
    }

    public void setTopic(String topic) {
        this.topic = topic;
    }

    public String getClientId() {
        return clientId;
    }

    public void setClientId(String clientId) {
        this.clientId = clientId;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    @Override
    public String toString() {
        return (
                "SendMessageWebSocketRequest{" +
                        "topics='" +
                        topic +
                        '\'' +
                        ", clientId='" +
                        clientId +
                        '\'' +
                        ", content='" +
                        content +
                        '\'' +
                        '}'
        );
    }
}
