import Marketing from "../models/marketing.model.js";

const ESTADOS_VALIDOS = ["pendiente", "presupuestado", "aceptado", "rechazado", "cerrado"];

export const MarketingService = {
  async crearSolicitud(payload) {
    const { motivoConsulta, descripcion, creadoPor, creadoPorTipo, clienteId } = payload;
    if (!motivoConsulta) throw new Error("motivoConsulta es requerido");

    const doc = await Marketing.create({
      motivoConsulta,
      descripcion: descripcion || "",
      estado: "pendiente",
      creadoPor,
      creadoPorTipo,
      clienteId: clienteId ?? null,
      historialEstados: [{ estado: "pendiente", fecha: new Date(), autor: creadoPor, autorTipo: creadoPorTipo, nota: "Solicitud creada" }],
    });

    return doc;
  },

  listarSolicitudes({ estado }) {
    const filtro = {};
    if (estado) filtro.estado = estado;
    return Marketing.find(filtro).sort({ createdAt: -1 }).lean();
  },

  obtenerDetalle(id) {
    return Marketing.findById(id).lean();
  },

  async actualizarPresupuesto(id, { monto, detalle, enviadoAlCliente, autor, autorTipo }) {
    const doc = await Marketing.findById(id);
    if (!doc) throw new Error("Solicitud no encontrada");

    doc.presupuesto.monto = Number(monto ?? doc.presupuesto?.monto ?? 0);
    doc.presupuesto.detalle = detalle ?? doc.presupuesto?.detalle ?? "";
    doc.presupuesto.enviadoAlCliente = Boolean(enviadoAlCliente);

    if (enviadoAlCliente && doc.estado === "pendiente") {
      doc.estado = "presupuestado";
      doc.historialEstados.push({ estado: "presupuestado", fecha: new Date(), autor, autorTipo, nota: "Presupuesto enviado al cliente" });
    }

    await doc.save();
    return doc;
  },

  async cambiarEstado(id, { estado, nota, autor, autorTipo }) {
    if (!ESTADOS_VALIDOS.includes(estado)) throw new Error("Estado inválido");

    const doc = await Marketing.findById(id);
    if (!doc) throw new Error("Solicitud no encontrada");
    if (doc.estado === estado) throw new Error(`La solicitud ya está en estado "${estado}"`);

    doc.estado = estado;
    doc.historialEstados.push({ estado, fecha: new Date(), autor, autorTipo, nota: nota ?? "" });

    await doc.save();
    return doc;
  },

  async agregarComentario(id, { mensaje, autor, autorTipo }) {
    if (!mensaje) throw new Error("El comentario no puede estar vacío");

    const doc = await Marketing.findById(id);
    if (!doc) throw new Error("Solicitud no encontrada");

    doc.comentariosInternos.push({ mensaje, autor, autorTipo, fecha: new Date() });
    await doc.save();
    return doc;
  },
};
