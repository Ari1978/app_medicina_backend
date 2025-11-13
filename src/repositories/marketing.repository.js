import Marketing from "../models/marketing.model.js";

export const MarketingRepository = {
  async crear(data) {
    return await Marketing.create(data);
  },

  async listar(filtro = {}) {
    return await Marketing.find(filtro).sort({ createdAt: -1 }).lean();
  },

  async obtenerPorId(id) {
    return await Marketing.findById(id).lean();
  },

  async guardar(doc) {
    return await doc.save();
  },
};
