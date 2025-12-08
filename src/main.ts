import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { CorsOptions } from "@nestjs/common/interfaces/external/cors-options.interface";
import cookieParser from "cookie-parser";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ CORS PARA LOCAL + PRODUCCIÓN (VERCEL)
  const whitelist = (
    process.env.FRONTEND_URL ||
    "http://localhost:3000,http://localhost:5173,https://app-medicina-frontend-f4o1g81v9-ari1978s-projects.vercel.app"
  ).split(",");

  const corsOptions: CorsOptions = {
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void
    ) => {
      if (!origin || whitelist.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS bloqueado"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  };

  app.enableCors(corsOptions);

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
