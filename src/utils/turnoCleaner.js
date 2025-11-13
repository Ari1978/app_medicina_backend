// src/utils/turnoCleaner.js
import cron from "node-cron";
import Turno from "../models/turno.model.js";

// 🧹 Limpia turnos provisionales de más de 10 minutos
export const initTurnoCleaner = (io) => {
  console.log("🧹 TurnoCleaner activo: eliminará turnos provisionales > 10 minutos");

  // Ejecuta cada 10 minutos
  cron.schedule("*/10 * * * *", async () => {
    const hace10Min = new Date(Date.now() - 10 * 60 * 1000);

    try {
      const result = await Turno.deleteMany({
        provisional: true,
        createdAt: { $lt: hace10Min },
      });

      if (result.deletedCount > 0) {
        console.log(`🧽 TurnoCleaner: ${result.deletedCount} turnos eliminados`);
        if (io) io.emit("turnosActualizados");
      }
    } catch (err) {
      console.error("❌ Error en TurnoCleaner:", err);
    }
  });
};
