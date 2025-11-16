// src/controllers/asesoramiento.controller.js
import { AsesoramientoService } from "../services/asesoramiento.service.js";
import { asesoramientoResponseDTO } from "../dto/asesoramiento.dto.js";

export const AsesoramientoController = {
  async crear(req, res) {
    try {
      const user = req.user;
      if (!user) return res.status(401).json({ message: "No autenticado" });

      const { empresa, cuit, contacto, servicio, mensaje } = req.body;
      if (
        !empresa ||
        !cuit ||
        !contacto?.nombre ||
        !contacto?.email ||
        !contacto?.telefono ||
        !servicio ||
        !mensaje
      ) {
        return res.status(400).json({ message: "Faltan datos requeridos" });
      }

      const payload = {
        empresa: empresa.trim(),
        cuit: cuit.trim(),
        contacto: {
          nombre: contacto.nombre.trim(),
          email: contacto.email.trim(),
          telefono: contacto.telefono.trim(),
        },
        servicio: servicio.trim(),
        mensaje: mensaje.trim(),
        creadoPor: user._id,
        creadoPorTipo: user.role,
      };

      const solicitud = await AsesoramientoService.crearSolicitud(payload);
      return res.status(201).json({
        message: "✅ Solicitud registrada correctamente",
        solicitud: asesoramientoResponseDTO(solicitud),
      });
    } catch (err) {
      console.error("❌ ERROR crear solicitud:", err);
      return res
        .status(500)
        .json({ message: err.message || "Error creando solicitud" });
    }
  },

  async listar(req, res) {
    try {
      const user = req.user;
      if (!user) return res.status(401).json({ message: "No autenticado" });

      const solicitudes = await AsesoramientoService.listarSolicitudes();
      return res.json(solicitudes.map(asesoramientoResponseDTO));
    } catch (err) {
      console.error("❌ ERROR listar solicitudes:", err);
      return res
        .status(500)
        .json({ message: "Error obteniendo solicitudes" });
    }
  },

  async actualizarEstado(req, res) {
    try {
      const user = req.user;
      if (!user) return res.status(401).json({ message: "No autenticado" });

      const { estado, nota } = req.body;
      const { id } = req.params;

      const solicitud = await AsesoramientoService.actualizarEstado(id, {
        estado,
        autor: user._id,
        autorTipo: user.role,
        nota: nota ?? "",
      });

      if (!solicitud)
        return res.status(404).json({ message: "Solicitud no encontrada" });

      return res.json({
        message: "✅ Estado actualizado correctamente",
        solicitud: asesoramientoResponseDTO(solicitud),
      });
    } catch (err) {
      console.error("❌ ERROR actualizar estado:", err);
      return res
        .status(500)
        .json({ message: err.message || "Error actualizando estado" });
    }
  },
};
