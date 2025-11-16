// src/workers/carrito.worker.js
import { Worker } from "bullmq";
import { bullConnection } from "../config/redis.js";

import { TurnoRepository } from "../repositories/turno.repository.js";
import { CarritoRepository } from "../repositories/carrito.repository.js";
import { publishTurnosEvent, publishCarritoEvent } from "../utils/eventBus.js";

export const carritoWorker = new Worker(
  "carritoQueue",
  async (job) => {
    try {
      const { action, userId, turnoId, data } = job.data;

      if (!action) throw new Error("Falta acción en job");

      switch (action) {
        // ====================================================
        // 🟡 AGREGAR TURNO (CREA PROVISIONAL EN TURNOS)
        // ====================================================
        case "AGREGAR_TURNO": {
          const { actor, ...payload } = data;

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
            if (!valor || valor === "") {
              throw new Error(`Falta el campo requerido: ${campo}`);
            }
          }

          const turno = await TurnoRepository.create({
            ...payload,
            user: userId,
            empresaId: userId,
            estado: "provisional",
            provisional: true,
            confirmado: false,
            creadoPor: actor.autor,
            creadoPorTipo: actor.autorTipo,
          });

          await publishTurnosEvent("turno:provisional", {
            turnoId: turno._id,
            fecha: turno.fecha,
            hora: turno.hora,
            userId,
          });

          return turno;
        }

        // ====================================================
        // 🗑 ELIMINAR TURNO (BORRA TURNO PROVISIONAL)
        // ====================================================
        case "ELIMINAR_TURNO": {
          await TurnoRepository.eliminar(turnoId);

          await publishTurnosEvent("turno:eliminado", { turnoId, userId });

          return true;
        }

        // ====================================================
        // 🧹 VACIAR CARRITO = borrar todos los provisionales del user
        // ====================================================
        case "VACIAR_CARRITO": {
          await CarritoRepository.vaciarCarrito(userId);

          await publishCarritoEvent("carrito:vaciado", { userId });

          return true;
        }

        // ====================================================
        // 🟢 CONFIRMAR TODO EL CARRITO
        // ====================================================
        case "CONFIRMAR_CARRITO": {
          // Primero obtengo los turnos antes de confirmarlos para poder emitir eventos
          const provisionales = await CarritoRepository.getCarrito(userId);

          await CarritoRepository.confirmarCarrito(userId);

          for (const t of provisionales) {
            await publishTurnosEvent("turno:confirmado", {
              turnoId: t._id,
              fecha: t.fecha,
              hora: t.hora,
              userId,
            });
          }

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
    concurrency: 5,
    autorun: true,
  }
);

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
