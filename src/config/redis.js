import { Redis } from "ioredis";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

// Para BullMQ  - objeto de conexión
export const redisConnection = {
  connection: REDIS_URL.startsWith("redis://")
    ? { host: REDIS_URL.replace("redis://", "").split(":")[0], port: Number(REDIS_URL.split(":").at(-1)) }
    : { host: "127.0.0.1", port: 6379 },
};

// (Opcional) Clientes sueltos si los necesitás
export const redisPub = new Redis(REDIS_URL);
export const redisSub = new Redis(REDIS_URL);

