// src/repositories/user.repository.js
// ---------------------------------------------------------------------
// Repositorio de Usuarios (Empresas / Clientes)
// - Abstrae acceso a la colección "users"
// - Usado por UsuarioAutorizadoService y otros módulos
// ---------------------------------------------------------------------

import User from "../models/user.model.js";

export const UserRepository = {
  // -------------------------------------------------------------
  // Crear un nuevo usuario autorizado
  // -------------------------------------------------------------
  async crear(datos) {
    const nuevo = new User(datos);
    await nuevo.save();
    return nuevo;
  },

  // -------------------------------------------------------------
  // Buscar usuario por ID
  // -------------------------------------------------------------
  async findById(id) {
    return await User.findById(id);
  },

  // -------------------------------------------------------------
  // Buscar usuario por CUIT
  // -------------------------------------------------------------
  async findByCuit(cuit) {
    if (!cuit) return null;
    return await User.findOne({ cuit });
  },

  // -------------------------------------------------------------
  // Listar todos los usuarios (solo empresas tipo "user")
  // -------------------------------------------------------------
  async listarTodos() {
    return await User.find({ role: "user" })
      .select("_id empresa cuit contacto email role")
      .sort({ empresa: 1 });
  },

  // -------------------------------------------------------------
  // Actualizar datos de usuario
  // -------------------------------------------------------------
  async actualizar(id, data) {
    return await User.findByIdAndUpdate(id, data, { new: true });
  },

  // -------------------------------------------------------------
  // Eliminar usuario
  // -------------------------------------------------------------
  async eliminar(id) {
    return await User.findByIdAndDelete(id);
  },
};
