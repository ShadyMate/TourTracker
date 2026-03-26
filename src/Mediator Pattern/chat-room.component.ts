// chat-room.component.ts - The Mediator Component
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatRoomService, Message, User } from './chat-room.service';

/**
 *
 * - COLLEAGUES: Objects that communicate with each other (text input, send button, message list, user list)
 * - MEDIATOR: Central object that coordinates all communication (ChatRoomComponent)
 * - Communication Flow: Colleague A -> Mediator -> Colleague B (NO direct communication)
 *
 *
 * Multiple UI Elements (Colleagues):
 * 1. Message Input Field - captures user input
 * 2. Send Button - triggers message sending
 * 3. Messages Display - shows all messages
 * 4. User List - shows active/inactive users
 * 5. Typing Indicator - shows who's typing
 * 6. Message Count Badge - shows total messages
 * 7. Status Selector - allows picking a user
 *
 * These elements DON'T communicate directly with each other
 * They ALL go through the Component (Mediator):
 *
 * Input Field (onInput) -> Component -> Updates state
 * Send Button (onClick) -> Component -> Creates message, updates count, updates display
 * User List (onClick) -> Component -> Broadcasts selection, updates status
 *
 * Why This is the Mediator Pattern:
 * - Loose coupling: UI elements don't know about each other
 * - Single responsibility: Component coordinates all interactions
 * - Easy to extend: Add new UI elements without changing existing ones
 * - Centralized logic: All business logic is in one place (the mediator/component)
 */

@Component({
  selector: 'app-chat-room',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-room.component.html',
  styleUrls: ['./chat-room.component.css']
})
export class ChatRoomComponent implements OnInit {
  // COLLEAGUE #1: Input Field State
  // This colleague captures the message being typed
  messageInput: string = '';

  // COLLEAGUE #2: Typing Indicator State
  // Shows which user is currently typing
  isTyping: boolean = false;
  typingTimeout: any;

  // COLLEAGUE #3: Messages Display State
  // Holds all messages in the chat room
  messages: Message[] = [
    {
      id: '1',
      username: 'Alice',
      content: 'Hey everyone! How is it going?',
      timestamp: new Date(Date.now() - 300000),
      color: '#FF6B6B'
    },
    {
      id: '2',
      username: 'Bob',
      content: 'Hello! All good here, just testing the mediator pattern',
      timestamp: new Date(Date.now() - 240000),
      color: '#4ECDC4'
    },
    {
      id: '3',
      username: 'Alice',
      content: 'K, the component acts as a central mediator',
      timestamp: new Date(Date.now() - 180000),
      color: '#FF6B6B'
    }
  ];

  // COLLEAGUE #4: User List State
  // Holds all users and their online status
  users: User[] = [];
  selectedUserId: string = '1';

  constructor(private chatService: ChatRoomService) {}

  ngOnInit(): void {
    // Initialize colleagues state
    this.users = this.chatService.getUsers();
  }

  /**
   * Handle User Input
   * 
   * When the input field (Colleague #1) receives input,
   * the component (MEDIATOR) handles it and updates the typing indicator
   *
   * Input Field -> Component.onMessageInput() -> Typing Indicator + State Update
   * No direct communication between input field and typing indicator!
   */
  onMessageInput(): void {
    // Input field (colleague) notified -> Mediator responds
    this.isTyping = this.messageInput.length > 0;

    // Clear previous timeout and set new one
    clearTimeout(this.typingTimeout);

    // Reset typing indicator after user stops typing for 2 seconds
    this.typingTimeout = setTimeout(() => {
      if (this.isTyping) {
        this.isTyping = false;
      }
    }, 2000);
  }

  /**
   * Send Message
   * 
   * When send button (Colleague) is clicked:
   * 1. Create new message
   * 2. Add to messages list (Colleague #3)
   * 3. Clear input field (Colleague #1)
   * 4. Update typing indicator (Colleague #2)
   * 5. Update message count display
   *
   * Send Button -> Component.sendMessage() -> Updates ALL colleagues
   * The button doesn't know about input field, messages, or count display!
   * The MEDIATOR coordinates all updates.
   */
  sendMessage(): void {
    // Validate input (Colleague #1)
    if (!this.messageInput.trim()) {
      return;
    }

    // Get selected user (Colleague #4)
    const selectedUser = this.users.find(u => u.id === this.selectedUserId);
    if (!selectedUser) {
      return;
    }

    // Create new message (affects Colleague #3 - Messages Display)
    const newMessage: Message = {
      id: Date.now().toString(),
      username: selectedUser.name,
      content: this.messageInput,
      timestamp: new Date(),
      color: selectedUser.color
    };

    // MEDIATOR: Update all affected colleagues
    // Colleague #3: Add message to display
    this.messages.push(newMessage);

    // Colleague #1: Clear input field
    this.messageInput = '';

    // Colleague #2: Reset typing indicator
    this.isTyping = false;
    clearTimeout(this.typingTimeout);

    // Scroll to bottom of messages (automatic in template)
  }

  /**
   * Handle User Selection
   * 
   * When user list (Colleague #4) item is clicked:
   * 1. Update selected user
   * 2. Might affect message color, sender display
   *
   * User List -> Component.selectUser() -> Update UI
   * UI elements don't communicate directly!
   */
  selectUser(userId: string): void {
    // User List (colleague) -> Component (Mediator) -> Updates state
    this.selectedUserId = userId;
  }

  /**
   * Toggle User Status
   * 
   * When user in list is right-clicked (or clicked):
   * 1. Update user status in service
   * 2. Trigger UI update (Angular change detection)
   */
  toggleUserStatus(userId: string, event: Event): void {
    event.preventDefault();
    // User List -> Component (Mediator) -> Service -> Update colleague state
    this.chatService.toggleUserStatus(userId);
    // Re-bind to trigger view update
    this.users = [...this.users];
  }

  /**
   * Delete Message
   * 
   * When delete button on message is clicked:
   * Updates the messages list and count
   */
  deleteMessage(messageId: string): void {
    // Message Display (colleague) -> Component (Mediator) -> Remove from list
    this.messages = this.messages.filter(m => m.id !== messageId);
  }

  /**
   * MEDIATOR COMPUTED PROPERTIES
   * 
   * These properties show how the mediator coordinates display
   */
  get messageCount(): number {
    return this.messages.length;
  }

  get onlineUserCount(): number {
    return this.users.filter(u => u.isOnline).length;
  }

  get selectedUserName(): string {
    return this.users.find(u => u.id === this.selectedUserId)?.name || 'Unknown';
  }

  /**
   * MEDIATOR UTILITY METHOD
   * 
   * Format timestamp for display
   */
  formatTime(date: Date): string {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }
}
