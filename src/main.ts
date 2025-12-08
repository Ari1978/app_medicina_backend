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
    'https://https://app-medicina-frontend-9i6jiwp3t-ari1978s-projects.vercel.app',
  ];

  app.enableCors({
    origin: (origin: string | undefined, callback: Function) => {
      if (!origin) return callback(null, true);
      if (whitelist.includes(origin)) return callback(null, true);
      return callback(new Error('CORS bloqueado: ' + origin), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
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

  const PORT = process.env.PORT || 3000;
  await app.listen(PORT);

  logger.log(`🚀 ASMEL API corriendo en puerto ${PORT}`);
}

bootstrap();
