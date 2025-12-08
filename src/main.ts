import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import type { CorsOptionsDelegate } from 'cors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  const whitelist = [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://app-medicina-frontend-cmuztbxwo-ari1978s-projects.vercel.app',
  ].filter(Boolean) as string[];

  const corsOptionsDelegate: CorsOptionsDelegate = (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void,
  ) => {
    if (!origin) return callback(null, true);
    if (whitelist.includes(origin)) return callback(null, true);
    return callback(new Error('CORS bloqueado: ' + origin), false);
  };

  app.enableCors({
    origin: corsOptionsDelegate,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.use(cookieParser());

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const PORT = process.env.PORT || 8080;

  await app.listen(PORT, '0.0.0.0');

  logger.log(`🚀 ASMEL API corriendo en puerto ${PORT}`);
}

bootstrap();
