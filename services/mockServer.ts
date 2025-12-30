import { User, Message, MessageType, AdminStats } from '../types';

// Simulation of server-side state in memory for the demo
class MockServer {
  private users: Map<string, User> = new Map();
  private messages: Message[] = [];
  private blockedIPs: Set<string> = new Set();
  
  // Auth stores
  private credentials = new Map<string, string>(); // nickname -> password
  private nicknameToId = new Map<string, string>(); // nickname -> userId
  
  constructor() {
    // Seed some data
    this.register('Admin', 'admin123');
    this.register('Ghost-8821', 'password');
  }

  // Internal helper or for ephemeral users
  createUser(nickname: string, isAnonymous: boolean): User {
    const id = Math.random().toString(36).substring(2, 10);
    const user: User = {
      id,
      nickname,
      isAnonymous,
      joinedAt: Date.now(),
    };
    this.users.set(id, user);
    this.nicknameToId.set(nickname, id);
    return user;
  }

  register(nickname: string, secret: string): { success: boolean; message?: string; user?: User } {
    if (this.nicknameToId.has(nickname)) {
        return { success: false, message: 'Codename already taken.' };
    }
    
    const id = Math.random().toString(36).substring(2, 10);
    const user: User = {
      id,
      nickname,
      isAnonymous: true,
      joinedAt: Date.now(),
    };
    
    this.users.set(id, user);
    this.nicknameToId.set(nickname, id);
    this.credentials.set(nickname, secret);
    
    return { success: true, user };
  }

  login(nickname: string, secret: string): { success: boolean; message?: string; user?: User } {
    if (!this.nicknameToId.has(nickname)) {
        return { success: false, message: 'Identity not found.' };
    }
    
    if (this.credentials.get(nickname) !== secret) {
        return { success: false, message: 'Invalid access key.' };
    }
    
    const userId = this.nicknameToId.get(nickname)!;
    const user = this.users.get(userId);
    
    return { success: true, user };
  }

  getStats(): AdminStats {
    return {
      activeUsers: this.users.size,
      activeRooms: 1, // Single global room for demo
      messagesSent: this.messages.length,
      bandwidthUsage: `${(Math.random() * 500).toFixed(2)} MB`,
      blockedIPs: this.blockedIPs.size,
    };
  }

  getUsers(): User[] {
    return Array.from(this.users.values());
  }

  sendMessage(msg: Message) {
    this.messages.push(msg);
    // Keep only last 50 messages in memory
    if (this.messages.length > 50) this.messages.shift();
  }

  getMessages(): Message[] {
    return this.messages;
  }

  markAsViewed(id: string) {
    const msg = this.messages.find(m => m.id === id);
    if (msg) {
        msg.viewed = true;
        msg.blurLevel = 0;
    }
  }

  expireMessage(id: string) {
    const msg = this.messages.find(m => m.id === id);
    if (msg) {
        msg.type = MessageType.DESTROY;
        msg.content = 'Media expired';
        msg.mediaUrl = undefined;
        msg.blurLevel = undefined;
    }
  }

  blockUser(userId: string) {
    this.users.delete(userId);
    this.blockedIPs.add(`192.168.1.${Math.floor(Math.random() * 255)}`);
  }
}

export const mockServer = new MockServer();