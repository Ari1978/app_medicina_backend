import Asesoramiento from "../models/asesoramiento.model.js";

export const AsesoramientoRepository = {
  async crear(data) {
    return await Asesoramiento.create(data);
  },

  async listar() {
    return await Asesoramiento.find().sort({ createdAt: -1 }).lean();
  },

  async buscarPorId(id) {
    return await Asesoramiento.findById(id).lean();
  },

  async actualizarEstado(id, estado) {
    return await Asesoramiento.findByIdAndUpdate(id, { estado }, { new: true }).lean();
  },
};
