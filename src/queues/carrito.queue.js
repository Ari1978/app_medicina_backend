// src/queues/carrito.queue.js
import { Queue } from "bullmq";
import { bullConnection } from "../config/redis.js";

let carritoQueue;

try {
  carritoQueue = new Queue("carritoQueue", {
    connection: bullConnection,
  });

  console.log(
    "🧺 [CarritoQueue] Cola inicializada con Redis:",
    bullConnection.url
  );
} catch (err) {
  console.error("❌ [CarritoQueue] No se pudo inicializar:", err.message);
  throw err;
}

// Manejo de errores
carritoQueue.on("error", (err) => {
  console.error("❌ [CarritoQueue] Error en tiempo de ejecución:", err.message);
});

export { carritoQueue };
