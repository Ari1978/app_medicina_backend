// src/dto/user.dto.js

// DTO para crear usuario autorizado (empresa + contacto)
export const createUserDTO = (data) => {
  if (!data.empresa || !data.empresa.trim())
    throw new Error("La empresa es obligatoria");

  if (!data.cuit || !data.cuit.trim())
    throw new Error("El CUIT es obligatorio");

  if (!data.contacto || typeof data.contacto !== "object")
    throw new Error("Datos de contacto incompletos");

  if (!data.contacto.nombre?.trim())
    throw new Error("El nombre del contacto es obligatorio");

  if (!data.contacto.email?.trim())
    throw new Error("El email del contacto es obligatorio");

  if (!data.password || !data.password.trim())
    throw new Error("La contraseña es obligatoria");

  return {
    empresa: data.empresa.trim(),
    cuit: data.cuit.trim(),
    contacto: {
      nombre: data.contacto.nombre.trim(),
      email: data.contacto.email.trim(),
      telefono: data.contacto.telefono?.trim() || "",
    },
    password: data.password,
    role: "user", // siempre usuario autorizado
  };
};

// DTO para respuesta sin incluir contraseña
export const userResponseDTO = (user) => ({
  id: user._id,
  empresa: user.empresa,
  cuit: user.cuit,
  contacto: {
    nombre: user.contacto?.nombre,
    email: user.contacto?.email,
    telefono: user.contacto?.telefono,
  },
  role: user.role,
  activo: user.activo,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});
