import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // ✅ ORÍGENES PERMITIDOS (LOCAL + VERCEL)
  const whitelist = [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://app-medicina-frontend-jde5a1bfx-ari1978s-projects.vercel.app',
  ];

  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (!origin) return callback(null, true);
      if (whitelist.includes(origin)) return callback(null, true);
      return callback(new Error('CORS bloqueado: ' + origin), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.use(cookieParser());

  // ✅ PREFIJO GLOBAL
  app.setGlobalPrefix('api');

  // ✅ VALIDACIONES DTO
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // ✅ RENDER USA ESTE PUERTO
  const PORT = process.env.PORT || 4000;
  await app.listen(PORT);

  logger.log(`🚀 ASMEL API corriendo en puerto ${PORT}`);
}

bootstrap();
