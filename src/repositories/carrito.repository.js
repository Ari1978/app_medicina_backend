// src/repositories/carrito.repository.js
import Turno from "../models/turno.model.js";

export const CarritoRepository = {
  // 🧺 Obtener todos los turnos provisionales de un usuario
  async getCarrito(userId) {
    try {
      return await Turno.find({
        user: userId,
        provisional: true,
        confirmado: false,
      }).sort({ fecha: 1, hora: 1 });
    } catch (err) {
      console.error("❌ [CarritoRepository] getCarrito:", err);
      throw err;
    }
  },

  // ➕ Crear un turno provisional
  async agregarTurno(data) {
    try {
      const turno = new Turno({
        ...data,
        provisional: true,
        confirmado: false,
        estado: data.estado || "provisional",
      });

      await turno.save();
      console.log("✅ [CarritoRepository] Turno agregado al carrito:", turno._id);
      return turno;
    } catch (err) {
      console.error("❌ [CarritoRepository] agregarTurno:", err);
      throw err;
    }
  },

  // 🗑️ Eliminar un turno provisional
  async eliminarTurno(userId, turnoId) {
    try {
      const result = await Turno.findOneAndDelete({
        _id: turnoId,
        user: userId,
        provisional: true,
        confirmado: false,
      });
      return result;
    } catch (err) {
      console.error("❌ [CarritoRepository] eliminarTurno:", err);
      throw err;
    }
  },

  // 🧹 Vaciar todos los turnos provisionales del usuario
  async vaciarCarrito(userId) {
    try {
      const result = await Turno.deleteMany({
        user: userId,
        provisional: true,
        confirmado: false,
      });
      console.log(`🧹 [CarritoRepository] ${result.deletedCount} turnos eliminados`);
      return result;
    } catch (err) {
      console.error("❌ [CarritoRepository] vaciarCarrito:", err);
      throw err;
    }
  },

  // ✅ Confirmar todos los turnos del carrito
  async confirmarCarrito(userId) {
    try {
      const result = await Turno.updateMany(
        { user: userId, provisional: true, confirmado: false },
        { $set: { confirmado: true, provisional: false, estado: "confirmado" } }
      );
      console.log(`✅ [CarritoRepository] ${result.modifiedCount} turnos confirmados`);
      return result;
    } catch (err) {
      console.error("❌ [CarritoRepository] confirmarCarrito:", err);
      throw err;
    }
  },
};
