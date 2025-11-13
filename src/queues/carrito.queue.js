import { Queue } from "bullmq";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

const connection = { connection: { url: REDIS_URL } };

export const carritoQueue = new Queue("carritoQueue", connection);

carritoQueue.on("error", (err) => console.error("❌ [CarritoQueue] Error:", err.message));

console.log("🧺 [CarritoQueue] Cola inicializada");
