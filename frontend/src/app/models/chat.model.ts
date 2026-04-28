export interface ChatMessageRequest {
  receiverId: number;
  content: string;
}

export interface ChatUserInfo {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
}

export interface ChatMessageResponse {
  id: number;
  sender: ChatUserInfo;
  receiver: ChatUserInfo;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface ConversationSummary {
  conversationKey: string;
  participant1: ChatUserInfo;
  participant2: ChatUserInfo;
  lastMessage: string;
  lastActivity: string;
  messageCount: number;
}
