// src/repositories/turno.repository.js
import Turno from "../models/turno.model.js";
import mongoose from "mongoose";

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

export const TurnoRepository = {

  /* =====================================================
     🔹 Crear turno
  ===================================================== */
  async create(data) {
    const turno = new Turno(data);
    return await turno.save();
  },

  /* =====================================================
     🔹 Buscar por ID (NO usar lean → service usa save())
  ===================================================== */
  async findById(id) {
    if (!isValidId(id)) return null;

    return await Turno.findById(id).populate(
      "user",
      "empresa contacto nombre apellido email cuit"
    );
  },

  /* =====================================================
     🔹 Eliminar
  ===================================================== */
  async eliminar(turnoId) {
    if (!isValidId(turnoId)) return null;
    return await Turno.findByIdAndDelete(turnoId);
  },

  /* =====================================================
     🔹 Marcar como confirmado
  ===================================================== */
  async marcarConfirmado(turnoId) {
    if (!isValidId(turnoId)) return null;

    return await Turno.findByIdAndUpdate(
      turnoId,
      {
        $set: {
          estado: "confirmado",
          confirmado: true,
          provisional: false,
        },
      },
      { new: true }
    );
  },

  /* =====================================================
     🔹 Confirmados (staff/admin)
  ===================================================== */
  async findAllConfirmados() {
    return await Turno.find({ estado: "confirmado" })
      .populate("user", "empresa contacto nombre apellido email cuit")
      .sort({ fecha: 1, hora: 1 })
      .lean();
  },

  /* =====================================================
     🔹 Filtro dinámico
  ===================================================== */
  async findByFilter(filter) {
    const finalFilter = { ...filter };

    // Normalizar valores
    if (filter.confirmado === true) finalFilter.estado = "confirmado";
    if (filter.provisional === true) finalFilter.estado = "provisional";

    delete finalFilter.confirmado;
    delete finalFilter.provisional;

    return await Turno.find(finalFilter)
      .populate("user", "empresa contacto nombre apellido email cuit")
      .sort({ fecha: 1, hora: 1 })
      .lean();
  },

  /* =====================================================
     🔹 Confirmados por User
  ===================================================== */
  async findConfirmadosByUser(userId) {
    if (!isValidId(userId)) return [];

    return await Turno.find({
      empresaId: userId,
      estado: "confirmado",
    })
      .populate("user", "empresa contacto nombre apellido email cuit")
      .sort({ fecha: 1, hora: 1 })
      .lean();
  },

  /* =====================================================
     🔹 Provisionales por User
  ===================================================== */
  async findProvisionalesByUser(userId) {
    if (!isValidId(userId)) return [];

    return await Turno.find({
      empresaId: userId,
      estado: "provisional",
    })
      .populate("user", "empresa contacto nombre apellido email cuit")
      .sort({ fecha: 1, hora: 1 })
      .lean();
  },

  /* =====================================================
     🔹 Provisionales por User + Fecha
  ===================================================== */
  async findProvisionalesByUserAndDate(userId, fecha) {
    if (!isValidId(userId)) return [];

    return await Turno.find({
      empresaId: userId,
      fecha,
      estado: "provisional",
    })
      .populate("user", "empresa contacto nombre apellido email cuit")
      .sort({ hora: 1 })
      .lean();
  },

  /* =====================================================
     🔹 Confirmar TODOS los provisionales de un User
  ===================================================== */
  async confirmarProvisionales(userId) {
    if (!isValidId(userId)) return null;

    return await Turno.updateMany(
      { empresaId: userId, estado: "provisional" },
      {
        $set: {
          estado: "confirmado",
          confirmado: true,
          provisional: false,
        },
      }
    );
  },
};
