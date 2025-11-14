// src/config/redis.js
import { createClient } from "redis";

const REDIS_URL = process.env.REDIS_URL;

if (!REDIS_URL) {
  throw new Error("❌ Falta REDIS_URL en .env");
}

// Detecta si es Upstash (rediss) y activa TLS automáticamente
const useTLS =
  REDIS_URL.startsWith("rediss://") ||
  REDIS_URL.includes("upstash.io");

export const redisClient = createClient({
  url: REDIS_URL,
  socket: useTLS
    ? {
        tls: true,
        rejectUnauthorized: false,
      }
    : {},
});

redisClient.on("error", (err) => {
  console.error("❌ [Redis] Error:", err.message);
});

redisClient.on("connect", () => {
  console.log("🔌 [Redis] Conectado a", useTLS ? "Upstash (TLS)" : "Redis local");
});

// Conexión (promesa)
await redisClient.connect();

// -------------------------------
// 🔥 BullMQ Config universal
// -------------------------------
export const bullConnection = useTLS
  ? {
      url: REDIS_URL,
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      tls: {
        rejectUnauthorized: false,
      },
    }
  : {
      url: REDIS_URL,
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    };
