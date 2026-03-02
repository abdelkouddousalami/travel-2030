import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Post, Comment, CreatePostRequest, CreateCommentRequest } from '../models/post.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private apiUrl = `${environment.apiUrl}/posts`;
  
  // Mock data for demonstration - will be replaced with real API calls
  private postsSubject = new BehaviorSubject<Post[]>([]);
  public posts$ = this.postsSubject.asObservable();
  
  private mockPosts: Post[] = [
    {
      id: 1,
      type: 'announcement',
      title: 'New Travel Guidelines Released',
      content: 'We have updated our travel guidelines to ensure a safer and more enjoyable experience for all users. Please review the new protocols before planning your next trip.',
      authorId: 1,
      authorName: 'Admin',
      authorInitials: 'AD',
      createdAt: new Date(Date.now() - 3600000),
      likes: 12,
      likedByCurrentUser: false,
      comments: [
        {
          id: 1,
          postId: 1,
          content: 'Great update! Very helpful information.',
          authorId: 2,
          authorName: 'Jean Dupont',
          authorInitials: 'JD',
          createdAt: new Date(Date.now() - 1800000),
          likes: 3,
          likedByCurrentUser: false
        }
      ],
      commentsCount: 1,
      showComments: false
    },
    {
      id: 2,
      type: 'advice',
      title: 'Tips for Budget Travel in Europe',
      content: 'Looking to travel Europe on a budget? Here are some proven strategies: book flights midweek, use local transportation, stay in hostels or use home-sharing services, and eat where locals eat.',
      authorId: 3,
      authorName: 'Marie Martin',
      authorInitials: 'MM',
      createdAt: new Date(Date.now() - 86400000),
      likes: 24,
      likedByCurrentUser: true,
      comments: [],
      commentsCount: 0,
      showComments: false
    },
    {
      id: 3,
      type: 'post',
      title: 'My Amazing Experience in Marrakech',
      content: 'Just returned from an incredible trip to Marrakech. The medina, the food, the culture - everything was beyond my expectations. Highly recommend visiting the Jardin Majorelle and getting lost in the souks.',
      authorId: 4,
      authorName: 'Pierre Laurent',
      authorInitials: 'PL',
      createdAt: new Date(Date.now() - 172800000),
      likes: 18,
      likedByCurrentUser: false,
      comments: [
        {
          id: 2,
          postId: 3,
          content: 'Marrakech is on my bucket list! How many days do you recommend?',
          authorId: 5,
          authorName: 'Sophie Bernard',
          authorInitials: 'SB',
          createdAt: new Date(Date.now() - 86400000),
          likes: 2,
          likedByCurrentUser: false
        },
        {
          id: 3,
          postId: 3,
          content: 'I would say 4-5 days is ideal to explore the main attractions.',
          authorId: 4,
          authorName: 'Pierre Laurent',
          authorInitials: 'PL',
          createdAt: new Date(Date.now() - 43200000),
          likes: 1,
          likedByCurrentUser: false
        }
      ],
      commentsCount: 2,
      showComments: false
    }
  ];

  private nextPostId = 4;
  private nextCommentId = 4;

  constructor(private http: HttpClient) {
    this.postsSubject.next(this.mockPosts);
  }

  getPosts(): Observable<Post[]> {
    // TODO: Replace with real API call
    // return this.http.get<Post[]>(this.apiUrl);
    return this.posts$;
  }

  getPostById(id: number): Observable<Post | undefined> {
    const post = this.mockPosts.find(p => p.id === id);
    return of(post);
  }

  createPost(request: CreatePostRequest, author: any): Observable<Post> {
    const newPost: Post = {
      id: this.nextPostId++,
      type: request.type,
      title: request.title,
      content: request.content,
      authorId: author?.id || 0,
      authorName: author?.firstName && author?.lastName 
        ? `${author.firstName} ${author.lastName}` 
        : author?.username || 'Anonymous',
      authorInitials: this.getInitials(author?.firstName, author?.lastName, author?.username),
      createdAt: new Date(),
      likes: 0,
      likedByCurrentUser: false,
      comments: [],
      commentsCount: 0,
      showComments: false
    };
    
    this.mockPosts.unshift(newPost);
    this.postsSubject.next([...this.mockPosts]);
    
    return of(newPost);
  }

  updatePost(id: number, updates: Partial<Post>): Observable<Post | undefined> {
    const index = this.mockPosts.findIndex(p => p.id === id);
    if (index !== -1) {
      this.mockPosts[index] = { ...this.mockPosts[index], ...updates, updatedAt: new Date() };
      this.postsSubject.next([...this.mockPosts]);
      return of(this.mockPosts[index]);
    }
    return of(undefined);
  }

  deletePost(id: number): Observable<boolean> {
    const index = this.mockPosts.findIndex(p => p.id === id);
    if (index !== -1) {
      this.mockPosts.splice(index, 1);
      this.postsSubject.next([...this.mockPosts]);
      return of(true);
    }
    return of(false);
  }

  toggleLike(postId: number): Observable<Post | undefined> {
    const post = this.mockPosts.find(p => p.id === postId);
    if (post) {
      post.likedByCurrentUser = !post.likedByCurrentUser;
      post.likes += post.likedByCurrentUser ? 1 : -1;
      this.postsSubject.next([...this.mockPosts]);
      return of(post);
    }
    return of(undefined);
  }

  addComment(request: CreateCommentRequest, author: any): Observable<Comment | undefined> {
    const post = this.mockPosts.find(p => p.id === request.postId);
    if (post) {
      const newComment: Comment = {
        id: this.nextCommentId++,
        postId: request.postId,
        content: request.content,
        authorId: author?.id || 0,
        authorName: author?.firstName && author?.lastName 
          ? `${author.firstName} ${author.lastName}` 
          : author?.username || 'Anonymous',
        authorInitials: this.getInitials(author?.firstName, author?.lastName, author?.username),
        createdAt: new Date(),
        likes: 0,
        likedByCurrentUser: false
      };
      
      post.comments.push(newComment);
      post.commentsCount++;
      this.postsSubject.next([...this.mockPosts]);
      
      return of(newComment);
    }
    return of(undefined);
  }

  toggleCommentLike(postId: number, commentId: number): Observable<Comment | undefined> {
    const post = this.mockPosts.find(p => p.id === postId);
    if (post) {
      const comment = post.comments.find(c => c.id === commentId);
      if (comment) {
        comment.likedByCurrentUser = !comment.likedByCurrentUser;
        comment.likes += comment.likedByCurrentUser ? 1 : -1;
        this.postsSubject.next([...this.mockPosts]);
        return of(comment);
      }
    }
    return of(undefined);
  }

  deleteComment(postId: number, commentId: number): Observable<boolean> {
    const post = this.mockPosts.find(p => p.id === postId);
    if (post) {
      const index = post.comments.findIndex(c => c.id === commentId);
      if (index !== -1) {
        post.comments.splice(index, 1);
        post.commentsCount--;
        this.postsSubject.next([...this.mockPosts]);
        return of(true);
      }
    }
    return of(false);
  }

  private getInitials(firstName?: string, lastName?: string, username?: string): string {
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
    if (username) {
      return username.substring(0, 2).toUpperCase();
    }
    return 'AN';
  }
}
