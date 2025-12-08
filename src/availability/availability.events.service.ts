import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class AvailabilityEventsService {
  private readonly redisUrl =
    process.env.REDIS_URL || 'redis://127.0.0.1:6379';

  private readonly pub = new Redis(this.redisUrl);
  private readonly sub = new Redis(this.redisUrl);

  publishTurnoUpdate(empresaId: string, fecha: string) {
    this.pub.publish(
      'turno.updated',
      JSON.stringify({ empresaId, fecha })
    );
  }

  subscribe(callback: (data: { empresaId: string; fecha: string }) => void) {
    this.sub.subscribe('turno.updated');
    this.sub.on('message', (_channel, message) => {
      callback(JSON.parse(message));
    });
  }
}
