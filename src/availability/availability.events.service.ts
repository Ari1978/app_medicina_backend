import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class AvailabilityEventsService implements OnModuleInit {
  private readonly logger = new Logger(AvailabilityEventsService.name);

  private pub!: Redis;
  private sub!: Redis;

  onModuleInit() {
    const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

    this.pub = new Redis(redisUrl, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      retryStrategy(times) {
        return Math.min(times * 500, 5000);
      },
    });

    this.sub = new Redis(redisUrl, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      retryStrategy(times) {
        return Math.min(times * 500, 5000);
      },
    });

    this.pub.on('connect', () => {
      this.logger.log('✅ Redis PUB conectado');
    });

    this.sub.on('connect', () => {
      this.logger.log('✅ Redis SUB conectado');
    });

    this.pub.on('error', (err: unknown) => {
      if (err instanceof Error) {
        this.logger.error('❌ Error Redis PUB:', err.message);
      } else {
        this.logger.error('❌ Error Redis PUB desconocido');
      }
    });

    this.sub.on('error', (err: unknown) => {
      if (err instanceof Error) {
        this.logger.error('❌ Error Redis SUB:', err.message);
      } else {
        this.logger.error('❌ Error Redis SUB desconocido');
      }
    });

    this.sub.subscribe('turno.updated');
  }

  publishTurnoUpdate(empresaId: string, fecha: string) {
    try {
      this.pub.publish(
        'turno.updated',
        JSON.stringify({ empresaId, fecha }),
      );
    } catch (err: unknown) {
      if (err instanceof Error) {
        this.logger.error('❌ Error publicando evento:', err.message);
      } else {
        this.logger.error('❌ Error publicando evento desconocido');
      }
    }
  }

  subscribe(callback: (data: { empresaId: string; fecha: string }) => void) {
    this.sub.on('message', (_channel: string, message: string) => {
      try {
        const data = JSON.parse(message);
        callback(data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          this.logger.error('❌ Error procesando evento:', err.message);
        } else {
          this.logger.error('❌ Error procesando evento desconocido');
        }
      }
    });
  }
}
