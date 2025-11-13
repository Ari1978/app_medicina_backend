import cron from "node-cron";
import Turno from "../models/turno.model.js";

// ⏰ Cada 2 minutos revisa y libera turnos reservados con más de 10 minutos sin confirmar
cron.schedule("*/2 * * * *", async () => {
  const limite = new Date(Date.now() - 10 * 60 * 1000); // 10 minutos

  try {
    const resultado = await Turno.updateMany(
      {
        estado: "reservado",
        fechaReserva: { $lt: limite },
      },
      { $set: { estado: "disponible", fechaReserva: null } }
    );

    if (resultado.modifiedCount > 0) {
      console.log(`🧹 ${resultado.modifiedCount} turnos liberados por inactividad`);
    }
  } catch (error) {
    console.error("❌ Error al liberar turnos vencidos:", error.message);
  }
});

