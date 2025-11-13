import { UsuarioAutorizadoService } from "../services/usuarioAutorizado.service.js";
import { UserRepository } from "../repositories/user.repository.js";

export const UsuarioAutorizadoController = {
  // Crear usuario autorizado manualmente
  async crear(req, res) {
    try {
      const nuevo = await UsuarioAutorizadoService.crear(req.body);
      return res.status(201).json({ message: "✅ Usuario autorizado creado correctamente", user: nuevo });
    } catch (err) {
      console.error("❌ Error crear usuario autorizado:", err.message);
      return res.status(400).json({ message: err.message });
    }
  },

  // Listar todos los usuarios autorizados
  async listar(req, res) {
    try {
      const usuarios = await UsuarioAutorizadoService.listar();
      return res.json(usuarios);
    } catch (err) {
      console.error("❌ Error listar usuarios autorizados:", err.message);
      return res.status(500).json({ message: "Error al obtener usuarios" });
    }
  },

  // Validar existencia de CUIT (uso interno staff)
  async validarCuit(req, res) {
    try {
      const { cuit } = req.params;
      const existe = await UsuarioAutorizadoService.validarCuit(cuit);
      return res.json({ existe: !!existe });
    } catch (err) {
      console.error("❌ Error validar CUIT:", err.message);
      return res.status(400).json({ message: err.message });
    }
  },

  // Importar usuarios desde Excel
  async importar(req, res) {
    try {
      const { usuarios } = req.body;
      if (!Array.isArray(usuarios) || usuarios.length === 0) {
        return res.status(400).json({ message: "No hay usuarios para importar" });
      }
      const resultados = await UsuarioAutorizadoService.importarUsuarios(usuarios);
      return res.json({ resultados });
    } catch (err) {
      console.error("❌ Error importar usuarios:", err.message);
      return res.status(500).json({ message: "Error al importar usuarios" });
    }
  },

  // ✅ Validar CUIT para registro público
  async validarCuitRegistro(req, res) {
    try {
      const { cuit } = req.body;
      if (!cuit) return res.status(400).json({ message: "CUIT requerido" });

      const empresa = await UserRepository.findByCuit(cuit);
      if (!empresa) return res.status(404).json({ message: "CUIT no autorizado" });

      if (empresa.password && empresa.password !== "") {
        return res.status(400).json({ message: "Este CUIT ya tiene una cuenta registrada" });
      }

      return res.json({
        cuit: empresa.cuit,
        empresa: empresa.empresa,
        contacto: empresa.contacto || { nombre: "", email: "" },
      });
    } catch (err) {
      console.error("❌ Error validar CUIT registro:", err.message);
      return res.status(500).json({ message: "Error interno al validar CUIT" });
    }
  },
};
