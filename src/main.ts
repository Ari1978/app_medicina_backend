import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import cookieParser from "cookie-parser";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ CORS PARA LOCAL + PRODUCCIÓN (VERCEL)
  const whitelist = (
    process.env.FRONTEND_URL ||
    "http://localhost:3000,http://localhost:5173,https://app-medicina-frontend-f4o1g81v9-ari1978s-projects.vercel.app"
  ).split(",");

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || whitelist.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS bloqueado"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  });

  // ✅ Cookies
  app.use(cookieParser());

  // ✅ Prefijo global
  app.setGlobalPrefix("api");

  // ✅ Validaciones DTO
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
