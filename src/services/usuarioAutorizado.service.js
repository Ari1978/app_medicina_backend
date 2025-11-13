import { UserRepository } from "../repositories/user.repository.js";

export const UsuarioAutorizadoService = {
  async crear(datos) {
    const { empresa, cuit, contacto } = datos;
    if (!empresa || !cuit) throw new Error("Empresa y CUIT son obligatorios");

    const existe = await UserRepository.findByCuit(cuit);
    if (existe) throw new Error("Ya existe un usuario con ese CUIT");

    return await UserRepository.crear({
      empresa,
      cuit,
      contacto: contacto || { nombre: empresa, email: "" },
      password: "",
    });
  },

  async listar() {
    return await UserRepository.listarTodos();
  },

  async validarCuit(cuit) {
    if (!cuit) throw new Error("CUIT requerido");
    return await UserRepository.findByCuit(cuit);
  },

  async importarUsuarios(usuarios) {
    const resultados = [];
    for (const u of usuarios) {
      try {
        if (!u.cuit || !u.empresa) throw new Error("Faltan campos");
        const existe = await UserRepository.findByCuit(u.cuit);
        if (existe) {
          resultados.push({ cuit: u.cuit, status: "existente" });
          continue;
        }
        await UserRepository.crear({
          empresa: u.empresa,
          cuit: u.cuit,
          contacto: { nombre: u.empresa, email: "" },
          password: "",
        });
        resultados.push({ cuit: u.cuit, status: "creado" });
      } catch (err) {
        resultados.push({ cuit: u.cuit || "-", status: "error", error: err.message });
      }
    }
    return resultados;
  },
};
