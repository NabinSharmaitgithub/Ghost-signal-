import { User, Message, MessageType, AdminStats } from '../types';
import { auth, db } from './firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from 'firebase/auth';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  limit, 
  onSnapshot, 
  updateDoc, 
  doc, 
  getDocs, 
  setDoc, 
  getDoc, 
  getCountFromServer 
} from 'firebase/firestore';

// Unified Service to handle both Real Backend (Firebase) and Fallback (Mock)
class ApiService {
  private useMock: boolean = true;

  // Mock State
  private mockUsers: Map<string, User> = new Map();
  private mockMessages: Message[] = [];
  private mockCredentials = new Map<string, string>(); // nickname -> password
  private mockNicknameToId = new Map<string, string>(); // nickname -> userId
  private listeners: Function[] = [];

  constructor() {
    // Determine mode based on successful firebase initialization
    // We strictly check if auth/db exist.
    this.useMock = !auth || !db;

    // Seed mock data regardless, for fallback scenarios
    this.seedMockData();
  }

  private seedMockData() {
    this.registerMock('Admin', 'admin123');
    this.registerMock('Ghost-8821', 'password');
  }

  // --- AUTHENTICATION ---
  // Maps Codename + Secret Key to Firebase Email/Password Auth
  // Email format: [codename]@ghost.local

  async register(nickname: string, secret: string): Promise<{ success: boolean; message?: string; user?: User }> {
    if (!this.useMock && auth && db) {
      const email = `${nickname.replace(/\s+/g, '')}@ghost.local`; 
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, secret);
        const firebaseUser = userCredential.user;
        
        // Store user profile in Firestore
        const user: User = {
          id: firebaseUser.uid,
          nickname,
          isAnonymous: true,
          joinedAt: Date.now()
        };

        await setDoc(doc(db, 'users', firebaseUser.uid), user);

        return { success: true, user };
      } catch (error: any) {
        // Fallback to mock if Firebase Auth provider is not enabled in console
        if (error.code === 'auth/operation-not-allowed') {
            console.warn("GhostSignal: Firebase Email/Password Auth not enabled. Falling back to local mock.");
            return this.registerMock(nickname, secret);
        }
        return { success: false, message: error.message };
      }
    }

    return this.registerMock(nickname, secret);
  }

  async login(nickname: string, secret: string): Promise<{ success: boolean; message?: string; user?: User }> {
    if (!this.useMock && auth && db) {
      const email = `${nickname.replace(/\s+/g, '')}@ghost.local`;
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, secret);
        
        const userDocRef = doc(db, 'users', userCredential.user.uid);
        const userDoc = await getDoc(userDocRef);
        
        let user: User;
        if (userDoc.exists()) {
             user = userDoc.data() as User;
        } else {
             // Fallback if record missing
             user = {
                id: userCredential.user.uid,
                nickname: nickname,
                isAnonymous: true,
                joinedAt: Date.now()
             };
        }

        return { success: true, user };
      } catch (error: any) {
        // Fallback to mock if Firebase Auth provider is not enabled in console
        if (error.code === 'auth/operation-not-allowed') {
             console.warn("GhostSignal: Firebase Email/Password Auth not enabled. Falling back to local mock.");
             return this.loginMock(nickname, secret);
        }
        // Fallback if user not found in firebase but might exist in mock (dev convenience)
        if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
             const mockResult = this.loginMock(nickname, secret);
             if (mockResult.success) return mockResult;
        }
        
        return { success: false, message: error.message };
      }
    }

    return this.loginMock(nickname, secret);
  }

  // --- MESSAGING ---

  async sendMessage(msg: Message): Promise<void> {
    if (!this.useMock && db) {
        try {
            await addDoc(collection(db, 'messages'), {
                ...msg,
                timestamp: msg.timestamp // Ensure number format
            });
            return;
        } catch (e) {
            console.error("Firestore write failed, using mock", e);
            // Fallthrough to mock
        }
    }
    
    this.mockMessages.push(msg);
    if (this.mockMessages.length > 50) this.mockMessages.shift();
    this.notifyListeners();
  }

  async getMessages(): Promise<Message[]> {
    if (!this.useMock && db) {
        try {
            const q = query(collection(db, 'messages'), orderBy('timestamp', 'desc'), limit(50));
            const querySnapshot = await getDocs(q);
            const msgs: Message[] = [];
            querySnapshot.forEach((doc: any) => {
                msgs.push(doc.data() as Message);
            });
            return msgs.reverse(); // Return oldest first for chat UI
        } catch (e) {
            console.error("Firestore read failed", e);
        }
    }
    return [...this.mockMessages];
  }

  // Realtime Subscription
  subscribeToMessages(callback: (messages: Message[]) => void): { unsubscribe: () => void } {
    if (!this.useMock && db) {
        try {
            // Subscribe to last 50 messages
            const q = query(collection(db, 'messages'), orderBy('timestamp', 'desc'), limit(50));
            
            const unsubscribe = onSnapshot(q, (querySnapshot: any) => {
                const msgs: Message[] = [];
                querySnapshot.forEach((doc: any) => {
                    // We trust the document structure matches Message interface
                    msgs.push(doc.data() as Message);
                });
                // Firestore returns desc order (newest first), reverse for UI
                callback(msgs.reverse());
            }, (error) => {
                console.warn("Firestore subscription error, switching to mock", error);
                // If subscription fails (e.g. permissions), fallback to mock listener
                this.listeners.push(callback);
                callback([...this.mockMessages]);
            });

            return { unsubscribe };
        } catch(e) {
             console.error("Firestore setup error", e);
        }
    }

    // Mock Subscription
    this.listeners.push(callback);
    callback([...this.mockMessages]); // Initial call
    return { 
        unsubscribe: () => {
            this.listeners = this.listeners.filter(l => l !== callback);
        }
    };
  }

  async markAsViewed(id: string): Promise<void> {
    if (!this.useMock && db) {
        // Query to find the doc with this ID field (since we stored custom IDs)
        // Ideally we use firestore document IDs, but we generated a custom ID in ChatRoom
        const q = query(collection(db, 'messages'), orderBy('timestamp', 'desc'), limit(100)); // limit scope
        const snapshot = await getDocs(q);
        
        // This is inefficient in production (should use doc ID), but works for switching backend without refactoring entire app logic
        snapshot.forEach(async (d: any) => {
            if (d.data().id === id) {
                await updateDoc(doc(db!, 'messages', d.id), {
                    viewed: true,
                    blurLevel: 0
                });
            }
        });
        return; 
    }
    const msg = this.mockMessages.find(m => m.id === id);
    if (msg) {
        msg.viewed = true;
        msg.blurLevel = 0;
        this.notifyListeners();
    }
  }

  async expireMessage(id: string): Promise<void> {
    if (!this.useMock && db) {
        const q = query(collection(db, 'messages'), orderBy('timestamp', 'desc'), limit(100));
        const snapshot = await getDocs(q);
        
        snapshot.forEach(async (d: any) => {
            if (d.data().id === id) {
                 await updateDoc(doc(db!, 'messages', d.id), {
                    type: MessageType.DESTROY,
                    content: 'Media expired',
                    mediaUrl: null,
                    blurLevel: null
                });
            }
        });
       return;
    }
    const msg = this.mockMessages.find(m => m.id === id);
    if (msg) {
        msg.type = MessageType.DESTROY;
        msg.content = 'Media expired';
        msg.mediaUrl = undefined;
        msg.blurLevel = undefined;
        this.notifyListeners();
    }
  }

  // --- ADMIN ---

  async getStats(): Promise<AdminStats> {
    if (!this.useMock && db) {
        // Getting exact counts in Firestore can be expensive or requires 'count' aggregation queries
        // Using simple estimates or aggregation queries
        try {
            const usersColl = collection(db, 'users');
            const userSnapshot = await getCountFromServer(usersColl);
            
            const msgsColl = collection(db, 'messages');
            const msgSnapshot = await getCountFromServer(msgsColl);
            
            return {
                activeUsers: userSnapshot.data().count,
                activeRooms: 1,
                messagesSent: msgSnapshot.data().count,
                bandwidthUsage: `${(Math.random() * 500).toFixed(2)} MB`, // Mock
                blockedIPs: 0
            };
        } catch (e) {
            console.error("Stats error", e);
            return {
                activeUsers: 0,
                activeRooms: 1,
                messagesSent: 0,
                bandwidthUsage: '0 MB',
                blockedIPs: 0
            }
        }
    }

    return {
      activeUsers: this.mockUsers.size,
      activeRooms: 1, 
      messagesSent: this.mockMessages.length,
      bandwidthUsage: `${(Math.random() * 500).toFixed(2)} MB`,
      blockedIPs: 0,
    };
  }

  async getUsers(): Promise<User[]> {
      if (!this.useMock && db) {
          const snapshot = await getDocs(collection(db, 'users'));
          const users: User[] = [];
          snapshot.forEach((d: any) => users.push(d.data() as User));
          return users;
      }
      return Array.from(this.mockUsers.values());
  }

  blockUser(userId: string) {
      if (this.useMock) {
          this.mockUsers.delete(userId);
      }
      // Real implementation would ban user in Firebase Auth or add to a 'banned' collection
  }

  // --- MOCK HELPERS ---

  private registerMock(nickname: string, secret: string) {
    if (this.mockNicknameToId.has(nickname)) {
        return { success: false, message: 'Codename already taken.' };
    }
    const id = Math.random().toString(36).substring(2, 10);
    const user = { id, nickname, isAnonymous: true, joinedAt: Date.now() };
    this.mockUsers.set(id, user);
    this.mockNicknameToId.set(nickname, id);
    this.mockCredentials.set(nickname, secret);
    return { success: true, user };
  }

  private loginMock(nickname: string, secret: string) {
    if (!this.mockNicknameToId.has(nickname)) {
        return { success: false, message: 'Identity not found.' };
    }
    if (this.mockCredentials.get(nickname) !== secret) {
        return { success: false, message: 'Invalid access key.' };
    }
    const userId = this.mockNicknameToId.get(nickname)!;
    const user = this.mockUsers.get(userId);
    return { success: true, user };
  }

  private notifyListeners() {
      this.listeners.forEach(cb => cb([...this.mockMessages]));
  }
}

export const api = new ApiService();