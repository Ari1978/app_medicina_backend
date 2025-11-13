import { createClient } from "redis";

const PREFIX = "medlab";
export const CHANNEL_TURNOS = `${PREFIX}:turnos`;
export const CHANNEL_CARRITO = `${PREFIX}:carrito`;

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

const pub = createClient({ url: REDIS_URL });
const sub = createClient({ url: REDIS_URL });

pub.on("error", (err) => console.error("❌ [EventBus:pub] Redis error:", err));
sub.on("error", (err) => console.error("❌ [EventBus:sub] Redis error:", err));
pub.on("connect", () => console.log("🔌 [EventBus:pub] Conectado a Redis"));
sub.on("connect", () => console.log("🔌 [EventBus:sub] Conectado a Redis"));

// Conectar de inmediato
await pub.connect();
await sub.connect();

const buildMessage = (type, data) => JSON.stringify({
  type,
  data,
  at: new Date().toISOString(),
});

// Publicación
export async function publishTurnosEvent(type, data) {
  await pub.publish(CHANNEL_TURNOS, buildMessage(type, data));
}

export async function publishCarritoEvent(type, data) {
  await pub.publish(CHANNEL_CARRITO, buildMessage(type, data));
}

// Suscripción para reemitir a Socket.IO
export async function subscribeEventBus(io) {
  const handler = (channel) => async (raw) => {
    try {
      const msg = JSON.parse(raw);
      io.emit(msg.type, msg.data);
      console.log(`📣 [EventBus→Socket] ${channel} → ${msg.type}`, msg.data);
    } catch (e) {
      console.error("❌ [EventBus] Error parseando mensaje:", e);
    }
  };

  await sub.subscribe(CHANNEL_TURNOS, handler(CHANNEL_TURNOS));
  await sub.subscribe(CHANNEL_CARRITO, handler(CHANNEL_CARRITO));

  console.log(`🟢 [EventBus] Suscripto a: ${CHANNEL_TURNOS}, ${CHANNEL_CARRITO}`);
}

// Cierre ordenado
export async function closeEventBus() {
  try {
    await sub.unsubscribe(CHANNEL_TURNOS);
    await sub.unsubscribe(CHANNEL_CARRITO);
  } catch {}
  try { await sub.quit(); } catch {}
  try { await pub.quit(); } catch {}
  console.log("🛑 [EventBus] Conexiones Redis cerradas");
}
