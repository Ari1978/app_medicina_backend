export const saludMentalResponseDTO = (doc) => ({
  id: doc._id,
  nombreEmpresa: doc.nombreEmpresa,
  nombreContacto: doc.nombreContacto,
  celular: doc.celular,
  email: doc.email,
  motivoConsulta: doc.motivoConsulta,
  tipoServicio: doc.tipoServicio,
  notas: doc.notas || "",
  estado: doc.estado,
  historialEstados: (doc.historialEstados || []).map((h) => ({
    estado: h.estado,
    fecha: h.fecha,
    autorTipo: h.autorTipo,
    nota: h.nota || "",
  })),
  creadoPorTipo: doc.creadoPorTipo,
  clienteId: doc.clienteId?.toString() || null,
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt,
});

