import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class AvailabilityCacheService {
  private readonly redisUrl =
    process.env.REDIS_URL || 'redis://127.0.0.1:6379';

  private readonly redis = new Redis(this.redisUrl);

  async get(key: string) {
    const value = await this.redis.get(key);
    return value ? JSON.parse(value) : null;
  }

  async set(key: string, value: any, ttl = 60) {
    await this.redis.set(key, JSON.stringify(value), 'EX', ttl);
  }

  async del(key: string) {
    await this.redis.del(key);
  }
}
