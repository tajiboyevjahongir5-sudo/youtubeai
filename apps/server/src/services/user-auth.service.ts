import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { env } from '../env';

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
const JWT_SECRET = env.JWT_SECRET || 'jpilot_studio_secret_2026_dev_fallback_key';
const TOKEN_EXPIRY_DAYS = 7; // 7 kunlik xavfsiz sessiya

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

  public generateId(prefix: string): string {
    return `${prefix}${crypto.randomBytes(8).toString('hex')}`;
  }

  public hashPassword(password: string, salt: string): string {
    return crypto.scryptSync(password, salt, 64).toString('hex');
  }

  public createJWT(payload: { id: string; workspaceId: string }): string {
    const now = Math.floor(Date.now() / 1000);
    const exp = now + (TOKEN_EXPIRY_DAYS * 24 * 60 * 60);

    const header = { alg: 'HS256', typ: 'JWT' };
    const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
    
    const finalPayload = {
      iss: 'jpilot',
      aud: 'jpilot-app',
      sub: payload.id,
      id: payload.id,
      workspaceId: payload.workspaceId,
      iat: now,
      exp,
    };
    const encodedPayload = Buffer.from(JSON.stringify(finalPayload)).toString('base64url');
    
    const signature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest('base64url');
      
    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  public register(name: string, email: string, password: string): { token: string; user: User } {
    const normalizedEmail = email.toLowerCase().trim();
    if (!password || password.length < 10) {
      throw new Error('Parol kamida 10 ta belgidan iborat bo‘lishi kerak');
    }

    const users = this.readUsers();
    const existingIndex = users.findIndex(u => u.email.toLowerCase() === normalizedEmail);
    if (existingIndex !== -1) {
      throw new Error('Email already exists');
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = this.hashPassword(password, salt);

    const newUser: User = {
      id: this.generateId('user_'),
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      salt,
      workspaceId: this.generateId('ws_'),
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    this.writeUsers(users);

    const token = this.createJWT({ id: newUser.id, workspaceId: newUser.workspaceId });
    return { token, user: newUser };
  }

  public login(email: string, password: string): { token: string; user: User } {
    const normalizedEmail = email.toLowerCase().trim();
    const users = this.readUsers();
    const user = users.find(u => u.email.toLowerCase() === normalizedEmail);

    if (!user) {
      throw new Error('Noto‘g‘ri email yoki parol');
    }

    const hash = this.hashPassword(password, user.salt);
    const hashBuf = Buffer.from(hash, 'hex');
    const storedBuf = Buffer.from(user.passwordHash, 'hex');

    // Constant-time comparison to prevent timing attacks
    if (hashBuf.length !== storedBuf.length || !crypto.timingSafeEqual(hashBuf, storedBuf)) {
      throw new Error('Noto‘g‘ri email yoki parol');
    }

    const token = this.createJWT({ id: user.id, workspaceId: user.workspaceId });
    return { token, user };
  }

  public verifyToken(token: string): any {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const [encodedHeader, encodedPayload, signature] = parts;

      // Strictly verify algorithm HS256
      const header = JSON.parse(Buffer.from(encodedHeader, 'base64url').toString('utf8'));
      if (header.alg !== 'HS256' || header.typ !== 'JWT') {
        return null;
      }

      const expectedSignature = crypto
        .createHmac('sha256', JWT_SECRET)
        .update(`${encodedHeader}.${encodedPayload}`)
        .digest('base64url');

      const sigBuf = Buffer.from(signature);
      const expSigBuf = Buffer.from(expectedSignature);

      // Constant-time signature verification
      if (sigBuf.length !== expSigBuf.length || !crypto.timingSafeEqual(sigBuf, expSigBuf)) {
        return null;
      }

      const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));
      
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < now) {
        return null; // Expired
      }

      if (payload.iss && payload.iss !== 'jpilot') {
        return null; // Invalid issuer
      }

      return payload;
    } catch (error) {
      return null;
    }
  }

  public changePassword(userId: string, currentPassword: string, newPassword: string): { success: boolean; message: string } {
    if (!newPassword || newPassword.length < 10) {
      throw new Error('Yangi parol kamida 10 ta belgidan iborat bo‘lishi kerak');
    }

    const users = this.readUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      throw new Error('Foydalanuvchi topilmadi');
    }

    const user = users[userIndex];
    if (currentPassword) {
      const hash = this.hashPassword(currentPassword, user.salt);
      const hashBuf = Buffer.from(hash, 'hex');
      const storedBuf = Buffer.from(user.passwordHash, 'hex');

      if (hashBuf.length !== storedBuf.length || !crypto.timingSafeEqual(hashBuf, storedBuf)) {
        throw new Error('Joriy parol noto‘g‘ri kiritildi');
      }
    }

    const newSalt = crypto.randomBytes(16).toString('hex');
    const newPasswordHash = this.hashPassword(newPassword, newSalt);

    users[userIndex].salt = newSalt;
    users[userIndex].passwordHash = newPasswordHash;
    this.writeUsers(users);

    return { success: true, message: 'Parol muvaffaqiyatli yangilandi!' };
  }

  public getUserById(userId: string): User | null {
    const users = this.readUsers();
    return users.find(u => u.id === userId) || null;
  }

  public getAllUsers(): User[] {
    return this.readUsers();
  }

  public getAllWorkspaces(): string[] {
    const users = this.readUsers();
    const workspaces = new Set<string>();
    for (const u of users) {
      if (u.workspaceId) {
        workspaces.add(u.workspaceId);
      }
    }
    return Array.from(workspaces);
  }
}

export const userAuthService = new UserAuthService();
