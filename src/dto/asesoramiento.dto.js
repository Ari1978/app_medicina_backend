export const asesoramientoResponseDTO = (doc) => ({
  id: doc._id,
  empresa: doc.empresa,
  cuit: doc.cuit,
  contacto: {
    nombre: doc.contacto?.nombre,
    email: doc.contacto?.email,
    telefono: doc.contacto?.telefono || "",
  },
  servicio: doc.servicio,
  mensaje: doc.mensaje,
  estado: doc.estado,
  historialEstados: (doc.historialEstados || []).map((h) => ({
    estado: h.estado,
    fecha: h.fecha,
    autorTipo: h.autorTipo,
    nota: h.nota || "",
  })),
  creadoPorTipo: doc.creadoPorTipo,
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt,
});

