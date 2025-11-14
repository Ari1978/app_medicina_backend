// src/workers/carrito.worker.js
import { Worker } from "bullmq";
import { bullConnection } from "../config/redis.js";

import { TurnoRepository } from "../repositories/turno.repository.js";
import { CarritoRepository } from "../repositories/carrito.repository.js";
import { publishTurnosEvent, publishCarritoEvent } from "../utils/eventBus.js";

// ------------------------------------------------------------------
// 🧠 Worker seguro (TLS, errores, reconexiones, logs detallados)
// ------------------------------------------------------------------
export const carritoWorker = new Worker(
  "carritoQueue",
  async (job) => {
    try {
      const { action, userId, turnoId, data } = job.data;

      if (!action) throw new Error("Falta acción en job");

      switch (action) {
        // ====================================================
        // 🟡 AGREGAR TURNO (CREA PROVISIONAL)
        // ====================================================
        case "AGREGAR_TURNO": {
          const { actor, ...payload } = data;

          // Validaciones críticas
          const requeridos = [
            "puesto",
            "empleado.nombre",
            "empleado.apellido",
            "empleado.dni",
            "contacto.nombre",
            "contacto.celular",
            "examenes",
            "fecha",
            "hora",
          ];

          for (const campo of requeridos) {
            let valor = payload;
            for (const parte of campo.split(".")) valor = valor?.[parte];

            if (!valor || valor === "")
              throw new Error(`Falta el campo requerido: ${campo}`);
          }

          // Crear provisional
          const turno = await TurnoRepository.create({
            ...payload,
            user: userId,
            empresaId: userId,
            estado: "provisional",
            creadoPor: actor.autor,
            creadoPorTipo: actor.autorTipo,
            historialEstados: [],
          });

          // Guardarlo en carrito
          await CarritoRepository.agregar({
            userId,
            empresaId: userId,
            turnoId: turno._id,
            fecha: turno.fecha,
            hora: turno.hora,
            empleado: turno.empleado,
            contacto: turno.contacto,
            puesto: turno.puesto,
            examenes: turno.examenes,
            creadoPor: actor.autor,
            creadoPorTipo: actor.autorTipo,
          });

          // Realtime event
          await publishTurnosEvent("turno:provisional", {
            turnoId: turno._id,
            fecha: turno.fecha,
            hora: turno.hora,
            userId,
          });

          return turno;
        }

        // ====================================================
        // 🗑 ELIMINAR TURNO DEL CARRITO
        // ====================================================
        case "ELIMINAR_TURNO": {
          await TurnoRepository.eliminar(turnoId);
          await CarritoRepository.eliminarPorTurno(turnoId);

          await publishTurnosEvent("turno:eliminado", { turnoId, userId });

          return true;
        }

        // ====================================================
        // 🧹 VACIAR CARRITO
        // ====================================================
        case "VACIAR_CARRITO": {
          await CarritoRepository.vaciar(userId);

          await publishCarritoEvent("carrito:vaciado", { userId });

          return true;
        }

        // ====================================================
        // 🟢 CONFIRMAR TODO EL CARRITO
        // ====================================================
        case "CONFIRMAR_CARRITO": {
          const items = await CarritoRepository.getCarrito(userId);

          for (const item of items) {
            await TurnoRepository.marcarConfirmado(item.turnoId);
            await CarritoRepository.marcarConfirmadoPorTurno(item.turnoId);

            await publishTurnosEvent("turno:confirmado", {
              turnoId: item.turnoId,
              fecha: item.fecha,
              hora: item.hora,
              userId,
            });
          }

          await CarritoRepository.vaciar(userId);

          return true;
        }

        // ====================================================
        // ❌ ACCIÓN NO RECONOCIDA
        // ====================================================
        default:
          throw new Error(`Acción desconocida: ${action}`);
      }
    } catch (err) {
      console.error("❌ [Worker] Error procesando job:", err.message);
      throw err;
    }
  },
  {
    connection: bullConnection,
    concurrency: 5, // para Render/Koyeb perfecto
    autorun: true,
  }
);

// ------------------------------------------------------------------
// LOGS
// ------------------------------------------------------------------
carritoWorker.on("completed", (job) =>
  console.log(`✅ Worker completó job ${job.id}`)
);

carritoWorker.on("failed", (job, err) =>
  console.error(`❌ Worker falló (${job?.id}):`, err?.message)
);

carritoWorker.on("error", (err) =>
  console.error("❌ Error global del Worker:", err.message)
);

console.log("⚙️ [CarritoWorker] Worker iniciado con BullMQ");
