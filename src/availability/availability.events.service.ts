import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class AvailabilityEventsService implements OnModuleInit {
  private readonly logger = new Logger(AvailabilityEventsService.name);

  private pub: Redis | null = null;
  private sub: Redis | null = null;

  onModuleInit() {
    const redisUrl = process.env.REDIS_URL;

    // ✅ Si no hay Redis, el sistema sigue funcionando igual
    if (!redisUrl) {
      this.logger.warn('⚠️ REDIS_URL no definida. Eventos en tiempo real desactivados.');
      return;
    }

    const redisOptions = {
      tls: {}, // ✅ requerido por Upstash (rediss://)
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      retryStrategy(times: number) {
        return Math.min(times * 500, 5000);
      },
    };

    this.pub = new Redis(redisUrl, redisOptions);
    this.sub = new Redis(redisUrl, redisOptions);

    this.pub.on('connect', () => {
      this.logger.log('✅ Redis PUB conectado correctamente');
    });

    this.sub.on('connect', () => {
      this.logger.log('✅ Redis SUB conectado correctamente');
    });

    this.pub.on('error', (err: unknown) => {
      if (err instanceof Error) {
        this.logger.error('❌ Error Redis PUB:', err.message);
      }
    });

    this.sub.on('error', (err: unknown) => {
      if (err instanceof Error) {
        this.logger.error('❌ Error Redis SUB:', err.message);
      }
    });

    this.sub.subscribe('turno.updated', (err) => {
      if (err) {
        this.logger.error('❌ Error al suscribirse a turno.updated');
      } else {
        this.logger.log('📡 Suscripto a turno.updated');
      }
    });
  }

  publishTurnoUpdate(empresaId: string, fecha: string) {
    if (!this.pub) return;

    try {
      this.pub.publish(
        'turno.updated',
        JSON.stringify({ empresaId, fecha }),
      );
    } catch (err) {
      if (err instanceof Error) {
        this.logger.error('❌ Error publicando evento:', err.message);
      }
    }
  }

  subscribe(callback: (data: { empresaId: string; fecha: string }) => void) {
    if (!this.sub) {
      this.logger.warn('⚠️ Redis SUB no disponible. Listener ignorado.');
      return;
    }

    this.sub.on('message', (_channel: string, message: string) => {
      try {
        const data = JSON.parse(message);
        callback(data);
      } catch (err) {
        if (err instanceof Error) {
          this.logger.error('❌ Error procesando evento:', err.message);
        }
      }
    });
  }
}
