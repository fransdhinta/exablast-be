import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TokenBlacklistService {
  private readonly blacklistedTokens: Set<string> = new Set();
  private readonly tokenExpiry: Map<string, number> = new Map();
  
  constructor(private configService: ConfigService) {
    // Periodically clean expired tokens from the blacklist
    setInterval(() => this.cleanupExpiredTokens(), 1000 * 60 * 15); // Every 15 minutes
  }
  
  blacklistToken(token: string, expiryTime: number): void {
    this.blacklistedTokens.add(token);
    this.tokenExpiry.set(token, expiryTime);
  }
  
  isBlacklisted(token: string): boolean {
    return this.blacklistedTokens.has(token);
  }
  
  private cleanupExpiredTokens(): void {
    const now = Math.floor(Date.now() / 1000);
    for (const [token, expiry] of this.tokenExpiry.entries()) {
      if (expiry < now) {
        this.blacklistedTokens.delete(token);
        this.tokenExpiry.delete(token);
      }
    }
  }
}