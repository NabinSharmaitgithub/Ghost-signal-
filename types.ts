
export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  SYSTEM = 'SYSTEM',
  CALL_OFFER = 'CALL_OFFER',
  CALL_ANSWER = 'CALL_ANSWER',
  ICE_CANDIDATE = 'ICE_CANDIDATE',
  DESTROY = 'DESTROY',
}

export interface User {
  id: string;
  nickname: string;
  isAnonymous: boolean;
  publicKey?: string; // Mock for E2EE
  joinedAt: number;
}

export interface Message {
  id: string;
  senderId: string;
  type: MessageType;
  content: string; // Encrypted string in real app
  timestamp: number;
  ephemeral: boolean;
  viewed: boolean;
  mediaUrl?: string;
  blurLevel?: number; // For progressive reveal
  duration?: number; // Duration in ms for ephemeral media
}

export interface Room {
  id: string;
  name: string;
  users: User[];
  messages: Message[];
  activeCall?: boolean;
}

export interface AdminStats {
  activeUsers: number;
  activeRooms: number;
  messagesSent: number;
  bandwidthUsage: string;
  blockedIPs: number;
}

export interface SystemNotification {
  id: string;
  type: 'INFO' | 'WARNING' | 'ERROR' | 'MAINTENANCE';
  message: string;
  timestamp: number;
}

export interface CallSession {
  isActive: boolean;
  type: 'video' | 'audio';
  status: 'calling' | 'ringing' | 'connected' | 'ended';
  peerId: string;
  startTime?: number;
}