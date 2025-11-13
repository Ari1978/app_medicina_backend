import SaludMental from "../models/saludMental.model.js";

const ESTADOS_VALIDOS = ["pendiente", "en_proceso", "finalizado", "cancelado"];

export const SaludMentalService = {
  async crearSolicitud(payload) {
    const { nombreEmpresa, nombreContacto, celular, email, motivoConsulta, tipoServicio, notas, creadoPor, creadoPorTipo, clienteId } = payload;
    if (!nombreEmpresa || !nombreContacto || !celular || !email || !motivoConsulta || !tipoServicio) {
      throw new Error("Faltan datos para crear la solicitud de Salud Mental");
    }

    const doc = await SaludMental.create({
      nombreEmpresa,
      nombreContacto,
      celular,
      email,
      motivoConsulta,
      tipoServicio,
      notas: notas ?? "",
      creadoPor,
      creadoPorTipo,
      clienteId: clienteId ?? null,
      estado: "pendiente",
      historialEstados: [{ estado: "pendiente", fecha: new Date(), autor: creadoPor, autorTipo: creadoPorTipo, nota: "Solicitud creada" }],
    });

    return doc;
  },

  async listarSolicitudes() {
    return await SaludMental.find().sort({ createdAt: -1 }).lean();
  },

  async listarPorCliente(clienteId) {
    return await SaludMental.find({ clienteId }).sort({ createdAt: -1 }).lean();
  },

  async cambiarEstado(id, { estado, nota, autor, autorTipo }) {
    if (!ESTADOS_VALIDOS.includes(estado)) throw new Error("Estado inválido");

    const doc = await SaludMental.findById(id);
    if (!doc) throw new Error("Solicitud no encontrada");
    if (doc.estado === estado) throw new Error(`La solicitud ya está en estado "${estado}"`);

    doc.estado = estado;
    doc.historialEstados.push({ estado, fecha: new Date(), autor, autorTipo, nota: nota ?? "" });
    await doc.save();
    return doc;
  },

  async notificarTurnos(id, { autor, autorTipo, eventBus }) {
    const doc = await SaludMental.findById(id);
    if (!doc) throw new Error("Solicitud no encontrada");

    if (doc.estado !== "en_proceso") {
      doc.estado = "en_proceso";
      doc.historialEstados.push({ estado: "en_proceso", fecha: new Date(), autor, autorTipo, nota: "Solicitud enviada a Mesa de Turnos" });
      await doc.save();
    }

    if (eventBus) {
      await eventBus.publish("saludMental:derivada", { solicitudId: doc._id, empresa: doc.nombreEmpresa, motivo: doc.motivoConsulta });
    }

    return doc;
  },
};
