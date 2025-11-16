export const marketingResponseDTO = (doc) => ({
  id: doc._id?.toString() || "",
  motivoConsulta: doc.motivoConsulta,
  descripcion: doc.descripcion || "",
  estado: doc.estado,
  presupuesto: {
    monto: doc.presupuesto?.monto || 0,
    detalle: doc.presupuesto?.detalle || "",
    enviadoAlCliente: doc.presupuesto?.enviadoAlCliente || false,
    fechaEnvio: doc.presupuesto?.fechaEnvio || null,
  },
  comentariosInternos: (doc.comentariosInternos || []).map((c) => ({
    mensaje: c.mensaje,
    fecha: c.fecha,
    autorTipo: c.autorTipo,
  })),
  historialEstados: (doc.historialEstados || []).map((h) => ({
    estado: h.estado,
    fecha: h.fecha,
    autorTipo: h.autorTipo,
    nota: h.nota || "",
  })),
  creadoPorTipo: doc.creadoPorTipo || "",
  clienteId: doc.clienteId?.toString() || null,
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt,
});

