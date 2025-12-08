import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // ✅ ORÍGENES PERMITIDOS (LOCAL + FRONT EN FLY)
  const whitelist = [
    'http://localhost:3000',
    'http://localhost:5173',
    process.env.FRONTEND_URL, // 👈 el front de Fly va acá
  ].filter(Boolean);

  app.enableCors({
    origin: (origin, callback) => {
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

  // ✅ PUERTO PARA FLY
  const PORT = process.env.PORT || 8080;

  // ✅ OBLIGATORIO EN FLY
  await app.listen(PORT, '0.0.0.0');

  logger.log(`🚀 ASMEL API corriendo en puerto ${PORT}`);
}

bootstrap();
