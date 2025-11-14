// src/repositories/turno.repository.js
import Turno from "../models/turno.model.js";
import mongoose from "mongoose";

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

export const TurnoRepository = {

  // Crear turno
  async create(data) {
    return await Turno.create(data);
  },

  // Buscar por ID
  async findById(id) {
    if (!isValidId(id)) return null;
    return await Turno.findById(id)
      .populate("user", "empresa contacto nombre apellido email cuit");
  },

  // Eliminar turno
  async eliminar(turnoId) {
    if (!isValidId(turnoId)) return null;
    return await Turno.findByIdAndDelete(turnoId);
  },

  // Confirmar turno individual
  async marcarConfirmado(turnoId) {
    if (!isValidId(turnoId)) return null;

    return await Turno.findByIdAndUpdate(
      turnoId,
      { $set: { provisional: false, confirmado: true } },
      { new: true }
    );
  },

  // Todos confirmados
  async findAllConfirmados() {
    return await Turno.find({ confirmado: true })
      .populate("user", "empresa contacto nombre apellido email cuit")
      .sort({ fecha: 1, hora: 1 })
      .lean();
  },

  // Filtro general
  async findByFilter(filter) {
    const finalFilter = { ...filter };
    return await Turno.find(finalFilter)
      .populate("user", "empresa contacto nombre apellido email cuit")
      .sort({ fecha: 1, hora: 1 })
      .lean();
  },

  // Confirmados por usuario
  async findConfirmadosByUser(userId) {
    if (!isValidId(userId)) return [];
    return await Turno.find({ user: userId, confirmado: true })
      .populate("user", "empresa contacto nombre apellido email cuit")
      .sort({ fecha: 1, hora: 1 })
      .lean();
  },

  // Provisionales por usuario
  async findProvisionalesByUser(userId) {
    if (!isValidId(userId)) return [];
    return await Turno.find({ user: userId, provisional: true })
      .populate("user", "empresa contacto nombre apellido email cuit")
      .sort({ createdAt: -1 })
      .lean();
  },

  // Confirmar todos los provisionales del usuario
  async confirmarProvisionales(userId) {
    if (!isValidId(userId)) return null;
    return await Turno.updateMany(
      { user: userId, provisional: true },
      { $set: { provisional: false, confirmado: true } }
    );
  },
};
