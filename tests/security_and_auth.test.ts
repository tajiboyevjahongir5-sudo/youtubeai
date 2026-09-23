import { describe, it, expect, beforeEach } from 'vitest';
import { userAuthService } from '../apps/server/src/services/user-auth.service';
import { UnconfiguredYouTubeService, MockYouTubeService } from '../apps/server/src/services/youtube.service';

describe('Security & Multi-Tenant Architecture Hardening Tests', () => {
  const testEmail = `sec_test_${Date.now()}@example.com`;
  const testPassword = 'StrongPassword123!';
  const ownerEmail = 'tjakhongir637@gmail.com';

  describe('1. Authentication & Password Hardening', () => {
    it('rejects passwords shorter than 10 characters', () => {
      expect(() => {
        userAuthService.register('Short Pwd', `short_${Date.now()}@test.com`, 'short123');
      }).toThrow('Parol kamida 10 ta belgidan iborat bo‘lishi kerak');
    });

    it('successfully registers user with strong password and returns valid JWT', () => {
      const { token, user } = userAuthService.register('Alice Security', testEmail, testPassword);
      expect(user.id).toBeDefined();
      expect(user.email).toBe(testEmail);
      expect(user.workspaceId).toMatch(/^ws_/);
      expect(token).toBeDefined();

      const decoded = userAuthService.verifyToken(token);
      expect(decoded).not.toBeNull();
      expect(decoded.sub).toBe(user.id);
      expect(decoded.iss).toBe('jpilot');
      expect(decoded.aud).toBe('jpilot-app');
    });

    it('rejects duplicate email registration with a clean error', () => {
      expect(() => {
        userAuthService.register('Alice Duplicate', testEmail, testPassword);
      }).toThrow('Email already exists');
    });

    it('rejects login with incorrect password', () => {
      expect(() => {
        userAuthService.login(testEmail, 'WrongPassword999!');
      }).toThrow('Noto‘g‘ri email yoki parol');
    });

    it('verifies owner backdoor is COMPLETELY REMOVED (wrong password never overwrites)', () => {
      // 1. Register owner with a known password
      const ownerCorrectPass = 'InitialOwnerPass123!';
      let ownerUser;
      try {
        const res = userAuthService.register('Owner Test', ownerEmail, ownerCorrectPass);
        ownerUser = res.user;
      } catch (e) {
        // If already in file
        ownerUser = userAuthService.getAllUsers().find(u => u.email === ownerEmail);
      }

      // 2. Attacker attempts to login as owner with wrong password
      expect(() => {
        userAuthService.login(ownerEmail, 'AttackerInjectedPassword123!');
      }).toThrow('Noto‘g‘ri email yoki parol');

      // 3. Verify owner account was NOT hijacked: original password still works!
      const loginResult = userAuthService.login(ownerEmail, ownerCorrectPass);
      expect(loginResult.user.email).toBe(ownerEmail);
      expect(loginResult.token).toBeDefined();
    });

    it('rejects forged JWT tokens with timingSafe signature checks', () => {
      const { token } = userAuthService.login(testEmail, testPassword);
      const parts = token.split('.');
      
      // Tamper payload
      const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
      payload.sub = 'user_admin_forged';
      const tamperedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
      const forgedToken = `${parts[0]}.${tamperedPayload}.${parts[2]}`;

      const verified = userAuthService.verifyToken(forgedToken);
      expect(verified).toBeNull();
    });

    it('enforces password change requiring valid current password', () => {
      const { user } = userAuthService.login(testEmail, testPassword);
      
      // Wrong current password
      expect(() => {
        userAuthService.changePassword(user.id, 'WrongOldPass123!', 'BrandNewPass123!');
      }).toThrow('Joriy parol noto‘g‘ri kiritildi');

      // New password too short
      expect(() => {
        userAuthService.changePassword(user.id, testPassword, 'short');
      }).toThrow('Yangi parol kamida 10 ta belgidan iborat bo‘lishi kerak');

      // Valid change
      const result = userAuthService.changePassword(user.id, testPassword, 'BrandNewPass123!');
      expect(result.success).toBe(true);

      // Verify login with new password
      const reLogin = userAuthService.login(testEmail, 'BrandNewPass123!');
      expect(reLogin.token).toBeDefined();
    });
  });

  describe('2. Multi-Tenant Workspace Isolation', () => {
    it('generates distinct, isolated workspaces for different users', () => {
      const userA = userAuthService.register('User A', `usera_${Date.now()}@test.com`, 'Password12345!');
      const userB = userAuthService.register('User B', `userb_${Date.now()}@test.com`, 'Password12345!');

      expect(userA.user.workspaceId).not.toBe(userB.user.workspaceId);

      const allWorkspaces = userAuthService.getAllWorkspaces();
      expect(allWorkspaces).toContain(userA.user.workspaceId);
      expect(allWorkspaces).toContain(userB.user.workspaceId);
    });
  });

  describe('3. YouTube Service Security & Mock Policy', () => {
    it('UnconfiguredYouTubeService throws clear error on upload instead of silent mock', async () => {
      const unconfigured = new UnconfiguredYouTubeService();
      expect(unconfigured.isAuthenticated('ws_test')).toBe(false);

      await expect(
        unconfigured.uploadVideo('ws_test', '/fake/path.mp4', { title: 'Test' })
      ).rejects.toThrow('YouTube integratsiyasi sozlanmagan');
    });

    it('MockYouTubeService does not hardcode owner workspace', () => {
      const mock = new MockYouTubeService();
      // Should not be authenticated for any workspace by default
      expect(mock.isAuthenticated('ws_j7ktjxw0')).toBe(false);
      expect(mock.isAuthenticated('ws_random')).toBe(false);

      // Only authenticated if explicitly connected in test
      mock.saveTokens('ws_test', { access_token: 'abc' });
      expect(mock.isAuthenticated('ws_test')).toBe(true);
      expect(mock.isAuthenticated('ws_random')).toBe(false);
    });
  });
});
