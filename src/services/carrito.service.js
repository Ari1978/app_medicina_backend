import { TurnoRepository } from "../repositories/turno.repository.js";

export const CarritoService = {
  // 🧺 Obtener los turnos provisionales del usuario
  async getCarrito(userId) {
    try {
      return await TurnoRepository.findProvisionalesByUser(userId);
    } catch (err) {
      console.error("❌ [CarritoService] getCarrito:", err);
      throw new Error("Error obteniendo el carrito");
    }
  },

  // ➕ Agregar turno provisional
  async addTurno(userId, data) {
    try {
      const { fecha, hora, empleado, contacto, puesto, examenes = [] } = data;

      if (!fecha || !hora || !empleado?.dni || !puesto || !contacto?.nombre || !contacto?.celular) {
        throw new Error("Faltan datos obligatorios del turno");
      }

      const turnoData = {
        user: userId,
        fecha,
        hora,
        empleado,
        contacto,
        puesto,
        examenes,
        provisional: true,
        confirmado: false,
      };

      const turno = await TurnoRepository.create(turnoData);
      console.log("✅ [CarritoService] Turno provisional creado:", turno._id);
      return turno;
    } catch (err) {
      console.error("❌ [CarritoService] addTurno:", err);
      throw new Error(err.message || "Error agregando turno al carrito");
    }
  },

  // 🗑️ Eliminar turno provisional
  async eliminarTurno(userId, turnoId) {
    try {
      const eliminado = await TurnoRepository.deleteProvisional(userId, turnoId);
      if (!eliminado) throw new Error("Turno no encontrado o ya confirmado");
      return eliminado;
    } catch (err) {
      console.error("❌ [CarritoService] eliminarTurno:", err);
      throw new Error(err.message || "Error eliminando turno del carrito");
    }
  },

  // 🧹 Vaciar todos los turnos provisionales del usuario
  async vaciarCarrito(userId) {
    try {
      const result = await TurnoRepository.clearProvisionales(userId);
      console.log(`🧹 [CarritoService] ${result.deletedCount} turnos provisionales eliminados`);
      return result;
    } catch (err) {
      console.error("❌ [CarritoService] vaciarCarrito:", err);
      throw new Error("Error vaciando el carrito");
    }
  },

  // ✅ Confirmar todos los turnos del carrito
  async confirmarCarrito(userId) {
    try {
      const result = await TurnoRepository.confirmarProvisionales(userId);
      console.log(`✅ [CarritoService] ${result.modifiedCount} turnos confirmados`);
      return result;
    } catch (err) {
      console.error("❌ [CarritoService] confirmarCarrito:", err);
      throw new Error("Error confirmando turnos");
    }
  },
};
