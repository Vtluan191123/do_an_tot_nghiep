export interface MessageDetailRequest {
  type: any;
  content?: any;     // text hoặc url
  emote?: string|null;
  files?: File[];
}

export interface MessageRequest {
  messageId?: string;
  groudId: string;
  senderId: number;
  messageDetailRequest: MessageDetailRequest;
}
