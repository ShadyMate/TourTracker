// chat-room.service.ts
import { Injectable } from '@angular/core';
import { signal } from '@angular/core';

/**
 * MEDIATOR PATTERN IN ANGULAR - Chat Room Service
 * ===============================================
 * This service manages the state for the chat room.
 * In the Mediator pattern, this would be additional state management.
 * However, the real MEDIATOR is the Component itself!
 *
 * The Component acts as the Mediator because it:
 * 1. Holds all state for multiple UI elements
 * 2. Coordinates interactions between them
 * 3. Prevents direct communication between UI elements
 * 4. Acts as a central hub for all logic
 */

export interface Message {
  id: string;
  username: string;
  content: string;
  timestamp: Date;
  color: string;
}

export interface User {
  id: string;
  name: string;
  isOnline: boolean;
  color: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatRoomService {
  // Predefined users
  private users: User[] = [
    { id: '1', name: 'Alice', isOnline: true, color: '#FF6B6B' },
    { id: '2', name: 'Bob', isOnline: true, color: '#4ECDC4' },
    { id: '3', name: 'Charlie', isOnline: false, color: '#95E1D3' },
    { id: '4', name: 'Diana', isOnline: true, color: '#FFE66D' },
    { id: '5', name: 'Eve', isOnline: false, color: '#A8E6CF' }
  ];

  getUsers(): User[] {
    return this.users;
  }

  toggleUserStatus(userId: string): void {
    const user = this.users.find(u => u.id === userId);
    if (user) {
      user.isOnline = !user.isOnline;
    }
  }
}
