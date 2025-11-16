export const adminResponseDTO = (admin) => ({
  id: admin._id,
  username: admin.username,
  nombre: admin.nombre,
  apellido: admin.apellido,
  role: admin.superadmin ? "superadmin" : "admin",
  activo: admin.activo,
  createdAt: admin.createdAt,
});

