// src/utils/turnoCleaner.js
import cron from "node-cron";
import Turno from "../models/turno.model.js";
import { CarritoRepository } from "../repositories/carrito.repository.js";
import { publishTurnosEvent } from "./eventBus.js";

// 🧹 Limpia turnos provisionales mayores a 10 minutos
export const initTurnoCleaner = () => {
  console.log(
    "🧹 TurnoCleaner activo: eliminará turnos provisionales > 10 minutos"
  );

  // Cada 10 minutos
  cron.schedule("*/10 * * * *", async () => {
    const limite = new Date(Date.now() - 10 * 60 * 1000);

    try {
      // Buscar turnos provisionales viejos
      const turnos = await Turno.find({
        estado: "provisional",
        createdAt: { $lt: limite },
      }).lean();

      if (!turnos.length) return;

      const ids = turnos.map((t) => t._id);

      // Borrar turnos
      const res = await Turno.deleteMany({ _id: { $in: ids } });

      // Limpiar carrito asociado
      await CarritoRepository.eliminarMuchos(ids);

      console.log(`🧽 TurnoCleaner: ${res.deletedCount} turnos eliminados`);

      // Emitir eventos realtime por Redis → Socket.IO
      for (const turno of turnos) {
        await publishTurnosEvent("turno:provisional:expirado", {
          turnoId: turno._id,
          fecha: turno.fecha,
          hora: turno.hora,
          userId: turno.user?.toString(),
        });
      }
    } catch (err) {
      console.error("❌ [TurnoCleaner] Error:", err.message);
    }
  });
};

