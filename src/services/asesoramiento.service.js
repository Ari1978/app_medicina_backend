import Asesoramiento from "../models/asesoramiento.model.js";

const ESTADOS_VALIDOS = ["pendiente", "en_proceso", "respondido", "cerrado"];

export const AsesoramientoService = {
  async crearSolicitud(payload) {
    const doc = await Asesoramiento.create(payload);
    doc.historialEstados.push({
      estado: "pendiente",
      fecha: new Date(),
      autor: payload.creadoPor,
      autorTipo: payload.creadoPorTipo,
      nota: "Solicitud creada",
    });
    await doc.save();
    return doc;
  },

  async listarSolicitudes() {
    return await Asesoramiento.find()
      .populate({ path: "creadoPor", select: "nombre apellido email cuit role" })
      .sort({ createdAt: -1 })
      .lean();
  },

  async actualizarEstado(id, { estado, autor, autorTipo, nota }) {
    if (!ESTADOS_VALIDOS.includes(estado)) throw new Error("Estado inválido");

    const doc = await Asesoramiento.findById(id);
    if (!doc) throw new Error("Solicitud no encontrada");
    if (doc.estado === estado) throw new Error("La solicitud ya está en ese estado");

    doc.estado = estado;
    doc.historialEstados.push({ estado, fecha: new Date(), autor, autorTipo, nota: nota || "" });

    await doc.save();
    return doc;
  },
};
