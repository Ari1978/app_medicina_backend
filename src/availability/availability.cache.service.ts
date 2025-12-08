import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class AvailabilityCacheService implements OnModuleInit {
  private redis!: Redis;
  private readonly logger = new Logger(AvailabilityCacheService.name);

  onModuleInit() {
    const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

    this.redis = new Redis(redisUrl, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      retryStrategy(times) {
        return Math.min(times * 500, 5000);
      },
    });

    this.redis.on('connect', () => {
      this.logger.log('✅ Redis conectado correctamente');
    });

    this.redis.on('error', (err: unknown) => {
      if (err instanceof Error) {
        this.logger.error('❌ Error de Redis:', err.message);
      } else {
        this.logger.error('❌ Error desconocido de Redis');
      }
    });
  }

  async get(key: string) {
    try {
      const value = await this.redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (err: unknown) {
      if (err instanceof Error) {
        this.logger.error('❌ Error GET Redis:', err.message);
      } else {
        this.logger.error('❌ Error GET Redis desconocido');
      }
      return null;
    }
  }

  async set(key: string, value: any, ttl = 60) {
    try {
      await this.redis.set(key, JSON.stringify(value), 'EX', ttl);
    } catch (err: unknown) {
      if (err instanceof Error) {
        this.logger.error('❌ Error SET Redis:', err.message);
      } else {
        this.logger.error('❌ Error SET Redis desconocido');
      }
    }
  }

  async del(key: string) {
    try {
      await this.redis.del(key);
    } catch (err: unknown) {
      if (err instanceof Error) {
        this.logger.error('❌ Error DEL Redis:', err.message);
      } else {
        this.logger.error('❌ Error DEL Redis desconocido');
      }
    }
  }
}

