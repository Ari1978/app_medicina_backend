import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import type { CorsOptionsDelegate } from 'cors';
import helmet from 'helmet';

import { loggerMiddleware } from './logger/logger.middleware';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // ===============================
  // HELMET — SECURITY HEADERS
  // ===============================
  app.use(
    helmet({
      // Necesario para frontend y backend en dominios distintos
      crossOriginResourcePolicy: { policy: 'cross-origin' },

      // Evita romper recursos externos (Vercel, PDFs, etc.)
      crossOriginEmbedderPolicy: false,
    }),
  );

  // ===============================
  // CORS
  // ===============================
  const whitelist = [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://app-medicina-frontend-ln7i2ahzb-ari1978s-projects.vercel.app',
  ].filter(Boolean) as string[];

  const corsOptionsDelegate: CorsOptionsDelegate = (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void,
  ) => {
    if (!origin) return callback(null, true); // mobile / postman
    if (whitelist.includes(origin)) return callback(null, true);
    return callback(new Error('CORS bloqueado: ' + origin), false);
  };

  app.use(loggerMiddleware);

  app.enableCors({
    origin: corsOptionsDelegate,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // ===============================
  // MIDDLEWARES
  // ===============================
  app.use(cookieParser());

  // ===============================
  // PREFIX
  // ===============================
  app.setGlobalPrefix('api');

  // ===============================
  // VALIDACIONES
  // ===============================
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // ===============================
  // SWAGGER
  // ===============================
  const swaggerConfig = new DocumentBuilder()
    .setTitle('ASMEL API')
    .setDescription('Documentación de la API de ASMEL')
    .setVersion('1.0')
    .addCookieAuth(
      'asmel_staff_token',
      {
        type: 'apiKey',
        in: 'cookie',
      },
      'asmel_staff_token',
    )
    .addCookieAuth(
      'asmel_empresa_token',
      {
        type: 'apiKey',
        in: 'cookie',
      },
      'asmel_empresa_token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);

  // 👉 Swagger siempre disponible
  SwaggerModule.setup('api/docs', app, document);

  // ===============================
  // START
  // ===============================
  const PORT = process.env.PORT || 8080;
  await app.listen(PORT, '0.0.0.0');

  logger.log(`🚀 ASMEL API corriendo en puerto ${PORT}`);
  logger.log(`📘 Swagger disponible en /api/docs`);
}

bootstrap();
