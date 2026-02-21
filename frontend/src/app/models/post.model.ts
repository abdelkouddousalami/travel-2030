export interface Post {
  id: number;
  type: 'announcement' | 'advice' | 'post';
  title: string;
  content: string;
  authorId: number;
  authorName: string;
  authorInitials: string;
  createdAt: Date;
  updatedAt?: Date;
  likes: number;
  likedByCurrentUser: boolean;
  comments: Comment[];
  commentsCount: number;
  showComments?: boolean;
}

export interface Comment {
  id: number;
  postId: number;
  content: string;
  authorId: number;
  authorName: string;
  authorInitials: string;
  createdAt: Date;
  likes: number;
  likedByCurrentUser: boolean;
}

export interface CreatePostRequest {
  type: 'announcement' | 'advice' | 'post';
  title: string;
  content: string;
}

export interface CreateCommentRequest {
  postId: number;
  content: string;
}
