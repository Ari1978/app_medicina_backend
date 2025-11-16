export const carritoItemDTO = (turno) => ({
  id: turno._id,
  fecha: turno.fecha,
  hora: turno.hora,
  provisional: turno.provisional,
  confirmado: turno.confirmado,
  empleado: turno.empleado,
  contacto: turno.contacto,
  puesto: turno.puesto,
  examenes: turno.examenes,
  motivo: turno.motivo,
  estado: turno.estado,
  createdAt: turno.createdAt,
});

