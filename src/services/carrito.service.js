// src/services/carrito.service.js
import { CarritoRepository } from "../repositories/carrito.repository.js";

export const CarritoService = {
  // 🧺 Obtener carrito (turnos provisionales del usuario)
  async getCarrito(userId) {
    return await CarritoRepository.getCarrito(userId);
  },

  // ➕ Agregar turno provisional al carrito
  async addTurno(userId, data) {
    try {
      const { fecha, hora, empleado, contacto, puesto, examenes = [], motivo } = data;

      if (!fecha || !hora) {
        throw new Error("Falta fecha u hora");
      }
      if (!empleado?.dni || !empleado?.nombre || !empleado?.apellido) {
        throw new Error("Faltan datos del empleado (nombre, apellido, dni)");
      }
      if (!contacto?.nombre || !contacto?.celular) {
        throw new Error("Faltan datos de contacto (nombre, celular)");
      }
      if (!puesto) {
        throw new Error("Falta el puesto");
      }

      // 🔥 Datos completos que exige el TurnoSchema
      const turnoData = {
        user: userId,
        empresaId: userId,

        creadoPor: userId,
        creadoPorTipo: "User", // carrito lo usa la empresa

        fecha,
        hora,
        empleado,
        contacto,
        puesto,
        examenes,
        motivo: motivo || "57", // "Pendiente" por defecto

        estado: "provisional",
        provisional: true,
        confirmado: false,
      };

      const turno = await CarritoRepository.agregarTurno(turnoData);
      return turno;
    } catch (err) {
      console.error("❌ [CarritoService] addTurno:", err);
      throw new Error(err.message || "Error agregando turno al carrito");
    }
  },

  // 🗑️ Eliminar un turno del carrito
  async eliminarTurno(userId, turnoId) {
    return await CarritoRepository.eliminarTurno(userId, turnoId);
  }

  ,

  // 🧹 Vaciar carrito
  async vaciarCarrito(userId) {
    return await CarritoRepository.vaciarCarrito(userId);
  },

  // ✅ Confirmar todos los turnos del carrito
  async confirmarCarrito(userId) {
    return await CarritoRepository.confirmarCarrito(userId);
  },
};
