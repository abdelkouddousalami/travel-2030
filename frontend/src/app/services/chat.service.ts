import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ChatMessageRequest, ChatMessageResponse, ConversationSummary } from '../models/chat.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private readonly API_URL = `${environment.apiUrl}/chat`;

  constructor(private http: HttpClient) {}

  sendMessage(request: ChatMessageRequest): Observable<ChatMessageResponse> {
    return this.http.post<ChatMessageResponse>(`${this.API_URL}/messages`, request);
  }

  getMyConversations(): Observable<ConversationSummary[]> {
    return this.http.get<ConversationSummary[]>(`${this.API_URL}/conversations`);
  }

  getConversation(userId: number): Observable<ChatMessageResponse[]> {
    return this.http.get<ChatMessageResponse[]>(`${this.API_URL}/messages/${userId}`);
  }

  markAsRead(userId: number): Observable<void> {
    return this.http.patch<void>(`${this.API_URL}/messages/${userId}/read`, null);
  }
}
