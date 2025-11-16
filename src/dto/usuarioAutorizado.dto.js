export const usuarioAutorizadoResponseDTO = (u) => ({
  id: u._id,
  empresa: u.empresa,
  cuit: u.cuit,
  contacto: {
    nombre: u.contacto?.nombre || "",
    email: u.contacto?.email || "",
    telefono: u.contacto?.telefono || "",
  },
  role: u.role,
  activo: u.activo,
  createdAt: u.createdAt,
});

