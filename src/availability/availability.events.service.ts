// src/availability/availability.events.service.ts
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';

export interface TurnoUpdatedEvent {
  turnoId: string;
  estado: 'confirmado' | 'realizado' | 'ausente' | 'cancelado';
}

@Injectable()
export class AvailabilityEventsService implements OnModuleInit {
  private readonly logger = new Logger(AvailabilityEventsService.name);

  private pub: Redis | null = null;
  private sub: Redis | null = null;

  onModuleInit() {
    const redisUrl = process.env.REDIS_URL;

    if (!redisUrl) {
      this.logger.warn(
        '⚠️ REDIS_URL no definida. Eventos en tiempo real desactivados.',
      );
      return;
    }

    const redisOptions = {
      tls: {},
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    };

    this.pub = new Redis(redisUrl, redisOptions);
    this.sub = new Redis(redisUrl, redisOptions);

    this.sub.subscribe('turno.updated', () => {
      this.logger.log('📡 Suscripto a turno.updated');
    });
  }

  // 🔔 PUBLICAR EVENTO
  publishTurnoUpdate(event: TurnoUpdatedEvent) {
    if (!this.pub) return;

    this.pub.publish(
      'turno.updated',
      JSON.stringify(event),
    );
  }

  // 👂 ESCUCHAR EVENTO
  subscribe(callback: (event: TurnoUpdatedEvent) => void) {
    if (!this.sub) return;

    this.sub.on('message', (_channel, message) => {
      try {
        callback(JSON.parse(message));
      } catch (err) {
        this.logger.error('❌ Error procesando evento');
      }
    });
  }
}
