export const staffResponseDTO = (staff) => ({
  id: staff._id,
  username: staff.username,
  nombre: staff.nombre,
  apellido: staff.apellido,
  role: staff.role,
  permisos: Array.isArray(staff.permisos) ? staff.permisos : [],
  activo: staff.activo,
  createdAt: staff.createdAt,
});

