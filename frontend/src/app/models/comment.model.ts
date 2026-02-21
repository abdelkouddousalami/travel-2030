export interface CommentRequest {
  content: string;
}

export interface CommentResponse {
  id: number;
  content: string;
  user: CommentUserInfo;
  createdAt: string;
  updatedAt: string;
}

export interface CommentUserInfo {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
}
