import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // FRONTEND_URL puede contener múltiples orígenes separados por coma
  const whitelist = (process.env.FRONTEND_URL || "http://localhost:5173,http://localhost:3001,http://localhost:3000")
    .split(",");

  app.enableCors({
    origin: whitelist,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  });

  // Cookies
  app.use(cookieParser());

  // Prefijo global
  app.setGlobalPrefix("api");

  // Validaciones DTO
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  const PORT = process.env.PORT || 3000;
  await app.listen(PORT);

  console.log(`🚀 ASMEL API corriendo en puerto ${PORT}`);
}

bootstrap();
