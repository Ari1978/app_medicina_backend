import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import http from "http";
import { Server as SocketServer } from "socket.io";
import app from "./app.js";
import { initTurnoCleaner } from "./utils/turnoCleaner.js";
import { seedSuperAdmin } from "./bootstrap/seedSuperAdmin.js";
import { subscribeEventBus, closeEventBus } from "./utils/eventBus.js";
// 🧵 inicia worker BullMQ
import "./workers/carrito.worker.js";

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/asmel";

const startServer = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("🟢 Conectado a MongoDB");

    await seedSuperAdmin();

    const server = http.createServer(app);
    const io = new SocketServer(server, {
      cors: { origin: process.env.FRONTEND_URL || "http://localhost:3000", credentials: true },
    });

    app.set("io", io);

    initTurnoCleaner(io);

    io.on("connection", (socket) => {
      console.log(`🔌 Socket conectado: ${socket.id}`);
      socket.on("disconnect", () => {
        console.log(`❌ Socket desconectado: ${socket.id}`);
      });
    });

    await subscribeEventBus(io);

    server.listen(PORT, () => {
      console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
    });

    const shutdown = async (sig) => {
      console.log(`🛑 Señal ${sig} recibida, cerrando...`);
      try {
        await closeEventBus();
        await mongoose.disconnect();
        server.close(() => process.exit(0));
      } catch (e) {
        console.error("❌ Error al cerrar servidor:", e);
        process.exit(1);
      }
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  } catch (err) {
    console.error("❌ Error iniciando servidor:", err);
    process.exit(1);
  }
};

startServer();
