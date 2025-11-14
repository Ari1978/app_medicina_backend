// src/utils/eventBus.js
import { redisClient } from "../config/redis.js";

const PREFIX = "medlab";
export const CHANNEL_TURNOS = `${PREFIX}:turnos`;
export const CHANNEL_CARRITO = `${PREFIX}:carrito`;

// --------------------------------------------------------
// 🟢 Publicador (pub) y Suscriptor (sub) aislados
// --------------------------------------------------------
const pub = redisClient;

const sub = redisClient.duplicate();
sub.on("error", (err) => {
  console.error("❌ [EventBus:sub] Error:", err.message);
});
sub.on("connect", () => {
  console.log("🔌 [EventBus:sub] Conectado");
});

await sub.connect();

// --------------------------------------------------------
// 🧱 Builder del payload
// --------------------------------------------------------
const buildMessage = (type, data) =>
  JSON.stringify({
    type,
    data,
    at: new Date().toISOString(),
  });

// --------------------------------------------------------
// 📤 Publicadores
// --------------------------------------------------------
export async function publishTurnosEvent(type, data) {
  try {
    await pub.publish(CHANNEL_TURNOS, buildMessage(type, data));
  } catch (err) {
    console.error("❌ [EventBus:pub turnos] Error:", err.message);
  }
}

export async function publishCarritoEvent(type, data) {
  try {
    await pub.publish(CHANNEL_CARRITO, buildMessage(type, data));
  } catch (err) {
    console.error("❌ [EventBus:pub carrito] Error:", err.message);
  }
}

// --------------------------------------------------------
// 📥 Suscripciones → Socket.IO
// --------------------------------------------------------
export async function subscribeEventBus(io) {
  const handler = (channel) => async (raw) => {
    try {
      const msg = JSON.parse(raw);

      // Enviar a todos los clientes
      io.emit(msg.type, msg.data);

      console.log(`📣 [EventBus → Socket] ${channel} → ${msg.type}`);
    } catch (err) {
      console.error("❌ Error parseando mensaje:", err.message);
    }
  };

  try {
    await sub.subscribe(CHANNEL_TURNOS, handler(CHANNEL_TURNOS));
    await sub.subscribe(CHANNEL_CARRITO, handler(CHANNEL_CARRITO));

    console.log(
      `🟢 [EventBus] Suscripto a: ${CHANNEL_TURNOS}, ${CHANNEL_CARRITO}`
    );
  } catch (err) {
    console.error("❌ [EventBus] Error al suscribirse:", err.message);
  }
}

// --------------------------------------------------------
// 🛑 Cierre limpio de conexiones
// --------------------------------------------------------
export async function closeEventBus() {
  try {
    await sub.unsubscribe(CHANNEL_TURNOS);
  } catch {}
  try {
    await sub.unsubscribe(CHANNEL_CARRITO);
  } catch {}
  try {
    await sub.quit();
  } catch {}
  try {
    await pub.quit();
  } catch {}

  console.log("🛑 [EventBus] Conexiones cerradas correctamente");
}
