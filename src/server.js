// src/server.js
// force redeploy cors - 2025-11-16
console.log("CORS REDEPLOY v1");

import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import http from "http";
import { Server as SocketServer } from "socket.io";

import app from "./app.js";
import { initTurnoCleaner } from "./utils/turnoCleaner.js";
import { seedSuperAdmin } from "./bootstrap/seedSuperAdmin.js";
import { subscribeEventBus, closeEventBus } from "./utils/eventBus.js";

// Carga el Worker antes de iniciar el server (no bloquea)
import "./workers/carrito.worker.js";

// ---------------------- ENV ----------------------
const PORT = process.env.PORT || 8000;
const MONGO_URI = process.env.MONGO_URI;
const FRONTEND_URL = process.env.FRONTEND_URL;

if (!MONGO_URI) {
  console.error("❌ ERROR FATAL: Falta MONGO_URI en variables de entorno");
  process.exit(1);
}

// ---------------------- START SERVER ----------------------
const startServer = async () => {
  try {
    // -----------------------------------------
    // 1️⃣ Conexión a MongoDB
    // -----------------------------------------
    await mongoose.connect(MONGO_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
    });

    console.log("🟢 Conectado a MongoDB");

    // Crear SuperAdmin si no existe
    await seedSuperAdmin();

    // -----------------------------------------
    // 2️⃣ HTTP + Socket.IO
    // -----------------------------------------
    const server = http.createServer(app);

    const io = new SocketServer(server, {
      cors: {
        origin: FRONTEND_URL || "*",
        credentials: true,
      },
      pingInterval: 25000,
      pingTimeout: 60000,
      transports: ["websocket", "polling"],
    });

    // Guardamos la instancia de socket en Express
    app.set("io", io);

    io.on("connection", (socket) => {
      console.log(`🔌 Socket conectado: ${socket.id}`);

      socket.on("disconnect", () => {
        console.log(`❌ Socket desconectado: ${socket.id}`);
      });
    });

    // -----------------------------------------
    // 3️⃣ Limpieza automática de turnos
    // -----------------------------------------
    try {
      initTurnoCleaner(io);
    } catch (err) {
      console.error("❌ Error iniciando TurnoCleaner:", err.message);
    }

    // -----------------------------------------
    // 4️⃣ EventBus (Redis)
    // -----------------------------------------
    try {
      await subscribeEventBus(io);
    } catch (err) {
      console.error("❌ Error suscribiendo EventBus:", err.message);
    }

    // -----------------------------------------
    // 5️⃣ Iniciar servidor HTTP
    // -----------------------------------------
    server.listen(PORT, () => {
      console.log(`🚀 Servidor escuchando en puerto ${PORT}`);
    });

    // -----------------------------------------
    // 6️⃣ Shutdown para Render/Koyeb
    // -----------------------------------------
    const shutdown = async (sig) => {
      console.log(`🛑 Señal ${sig} recibida → cerrando servidor...`);

      try {
        await closeEventBus();

        await mongoose.connection.close(false);
        console.log("🛑 Mongo cerrado correctamente");

        server.close(() => {
          console.log("🛑 HTTP cerrado");
          process.exit(0);
        });
      } catch (err) {
        console.error("❌ Error en apagado:", err);
        process.exit(1);
      }
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));

  } catch (err) {
    console.error("❌ Error iniciando servidor:", err.message);
    process.exit(1);
  }
};

startServer();
