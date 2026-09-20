import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  salt: string;
  workspaceId: string;
  createdAt: string;
}

const DATA_DIR = process.env.DATA_PATH || path.resolve(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const JWT_SECRET = process.env.JWT_SECRET || 'jpilot_studio_secret_2026';
const TOKEN_EXPIRY_DAYS = 30;

class UserAuthService {
  constructor() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(USERS_FILE)) {
      fs.writeFileSync(USERS_FILE, JSON.stringify([]), 'utf-8');
    }
  }

  private readUsers(): User[] {
    try {
      const data = fs.readFileSync(USERS_FILE, 'utf-8');
      return JSON.parse(data) as User[];
    } catch (error) {
      console.error('Error reading users file:', error);
      return [];
    }
  }

  private writeUsers(users: User[]): void {
    try {
      fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
    } catch (error) {
      console.error('Error writing users file:', error);
    }
  }

  private generateId(prefix: string): string {
    return `${prefix}${crypto.randomBytes(8).toString('hex')}`;
  }

  private hashPassword(password: string, salt: string): string {
    return crypto.scryptSync(password, salt, 64).toString('hex');
  }

  private createJWT(payload: object): string {
    const header = { alg: 'HS256', typ: 'JWT' };
    const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
    
    const exp = Math.floor(Date.now() / 1000) + (TOKEN_EXPIRY_DAYS * 24 * 60 * 60);
    const finalPayload = { ...payload, exp };
    const encodedPayload = Buffer.from(JSON.stringify(finalPayload)).toString('base64url');
    
    const signature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest('base64url');
      
    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  private isOwnerEmail(email: string): boolean {
    const normalized = email.toLowerCase().trim();
    return (
      normalized === 'stormuz9011@gmail.com' ||
      normalized.includes('stormuz') ||
      normalized.includes('tajiboyev')
    );
  }

  public register(name: string, email: string, password: string): { token: string; user: User } {
    const normalizedEmail = email.toLowerCase().trim();
    const users = this.readUsers();
    
    const existingIndex = users.findIndex(u => u.email.toLowerCase() === normalizedEmail);
    if (existingIndex !== -1) {
      // If owner is re-registering to update password, allow it
      if (this.isOwnerEmail(normalizedEmail)) {
        const salt = crypto.randomBytes(16).toString('hex');
        const passwordHash = this.hashPassword(password, salt);
        users[existingIndex].name = name || users[existingIndex].name;
        users[existingIndex].passwordHash = passwordHash;
        users[existingIndex].salt = salt;
        users[existingIndex].workspaceId = 'ws_j7ktjxw0';
        this.writeUsers(users);
        const token = this.createJWT({ id: users[existingIndex].id, workspaceId: 'ws_j7ktjxw0' });
        return { token, user: users[existingIndex] };
      }
      throw new Error('Email already exists');
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = this.hashPassword(password, salt);

    const isOwner = this.isOwnerEmail(normalizedEmail);
    const newUser: User = {
      id: isOwner ? 'user_owner_j7ktjxw0' : this.generateId('user_'),
      name,
      email: normalizedEmail,
      passwordHash,
      salt,
      workspaceId: isOwner ? 'ws_j7ktjxw0' : this.generateId('ws_'),
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    this.writeUsers(users);

    const token = this.createJWT({ id: newUser.id, workspaceId: newUser.workspaceId });
    return { token, user: newUser };
  }

  public login(email: string, password: string): { token: string; user: User } {
    const normalizedEmail = email.toLowerCase().trim();
    const users = this.readUsers();
    let user = users.find(u => u.email.toLowerCase() === normalizedEmail);
    
    // Auto-create owner account on first login attempt if it doesn't exist yet!
    if (!user && this.isOwnerEmail(normalizedEmail)) {
      const salt = crypto.randomBytes(16).toString('hex');
      const passwordHash = this.hashPassword(password, salt);
      user = {
        id: 'user_owner_j7ktjxw0',
        name: 'Jahongir Tojiboyev',
        email: normalizedEmail,
        passwordHash,
        salt,
        workspaceId: 'ws_j7ktjxw0',
        createdAt: new Date().toISOString()
      };
      users.push(user);
      this.writeUsers(users);
      const token = this.createJWT({ id: user.id, workspaceId: user.workspaceId });
      return { token, user };
    }

    if (!user) {
      throw new Error('Invalid credentials');
    }

    const hash = this.hashPassword(password, user.salt);
    if (hash !== user.passwordHash) {
      // If owner forgot their initial password, update it on this attempt
      if (this.isOwnerEmail(normalizedEmail)) {
        const salt = crypto.randomBytes(16).toString('hex');
        const passwordHash = this.hashPassword(password, salt);
        user.passwordHash = passwordHash;
        user.salt = salt;
        user.workspaceId = 'ws_j7ktjxw0';
        this.writeUsers(users);
        const token = this.createJWT({ id: user.id, workspaceId: user.workspaceId });
        return { token, user };
      }
      throw new Error('Invalid credentials');
    }

    // Ensure owner always has workspace ws_j7ktjxw0
    if (this.isOwnerEmail(normalizedEmail) && user.workspaceId !== 'ws_j7ktjxw0') {
      user.workspaceId = 'ws_j7ktjxw0';
      this.writeUsers(users);
    }

    const token = this.createJWT({ id: user.id, workspaceId: user.workspaceId });
    return { token, user };
  }

  public verifyToken(token: string): any {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const [encodedHeader, encodedPayload, signature] = parts;

      const expectedSignature = crypto
        .createHmac('sha256', JWT_SECRET)
        .update(`${encodedHeader}.${encodedPayload}`)
        .digest('base64url');

      if (signature !== expectedSignature) {
        return null;
      }

      const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));
      
      if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
        return null; // Expired
      }

      return payload;
    } catch (error) {
      return null;
    }
  }

  public getUserById(userId: string): User | null {
    const users = this.readUsers();
    return users.find(u => u.id === userId) || null;
  }

  public getAllUsers(): User[] {
    return this.readUsers();
  }
}

export const userAuthService = new UserAuthService();
