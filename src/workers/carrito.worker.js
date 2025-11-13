import { Worker } from "bullmq";
import { redisConnection } from "../config/redis.js";
import { TurnoRepository } from "../repositories/turno.repository.js";
import { CarritoRepository } from "../repositories/carrito.repository.js";
import { publishTurnosEvent, publishCarritoEvent } from "../utils/eventBus.js";

export const carritoWorker = new Worker(
  "carritoQueue",
  async (job) => {
    const { action, userId, turnoId, data } = job.data;

    switch (action) {
      case "AGREGAR_TURNO": {
        const { actor, ...payload } = data;

        // 1) Crear Turno provisional
        const turno = await TurnoRepository.crear({
          ...payload,
          empresaId: userId,
          estado: "provisional",
          creadoPor: actor.autor,
          creadoPorTipo: actor.autorTipo,
          historialEstados: [],
        });

        // 2) Agregar entrada al Carrito (linkeada al turno)
        await CarritoRepository.agregar({
          userId,
          empresaId: payload.empresaId ?? userId,
          turnoId: turno._id,
          fecha: turno.fecha,
          hora:  turno.hora,
          empleado: turno.empleado,
          contacto: turno.contacto,
          puesto: turno.puesto,
          examenes: turno.examenes,
          creadoPor: actor.autor,
          creadoPorTipo: actor.autorTipo,
        });

        // 3) Evento
        await publishTurnosEvent("turno:provisional", {
          turnoId: turno._id,
          fecha: turno.fecha,
          hora:  turno.hora,
          userId,
        });

        return turno;
      }

      case "ELIMINAR_TURNO": {
        // elimina el turno y su carrito asociado
        await TurnoRepository.eliminar(turnoId);
        await CarritoRepository.eliminarPorTurno(turnoId);

        await publishTurnosEvent("turno:eliminado", { turnoId, userId });
        return true;
      }

      case "VACIAR_CARRITO": {
        await CarritoRepository.vaciar(userId);
        await publishCarritoEvent("carrito:vaciado", { userId });
        return true;
      }

      case "CONFIRMAR_CARRITO": {
        const items = await CarritoRepository.getCarrito(userId);

        for (const c of items) {
          await TurnoRepository.marcarConfirmado(c.turnoId);
          await CarritoRepository.marcarConfirmadoPorTurno(c.turnoId);

          await publishTurnosEvent("turno:confirmado", {
            turnoId: c.turnoId,
            fecha: c.fecha,
            hora:  c.hora,
            userId,
          });
        }

        await CarritoRepository.vaciar(userId);
        return true;
      }

      default:
        throw new Error(`Acción no reconocida en worker: ${action}`);
    }
  },
  { connection: redisConnection }
);

carritoWorker.on("completed", (job) => {
  console.log(`✅ [Worker carrito] Job ${job.id} completado`);
});

carritoWorker.on("failed", (job, err) => {
  console.error(`❌ [Worker carrito] Job ${job?.id} falló:`, err?.message);
});
