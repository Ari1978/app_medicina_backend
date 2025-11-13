import { SaludMentalService } from "../services/saludMental.service.js";

export const SaludMentalController = {
  async crear(req, res) {
    try {
      const user = req.user;
      if (!user) return res.status(401).json({ message: "No autenticado" });

      const { nombreEmpresa, nombreContacto, celular, email, motivoConsulta, tipoServicio, notas } = req.body;
      if (!nombreEmpresa || !nombreContacto || !celular || !email || !motivoConsulta || !tipoServicio) {
        return res.status(400).json({ message: "Datos incompletos para crear solicitud" });
      }

      const payload = {
        nombreEmpresa: nombreEmpresa.trim(),
        nombreContacto: nombreContacto.trim(),
        celular: celular.trim(),
        email: email.trim(),
        motivoConsulta: motivoConsulta.trim(),
        tipoServicio,
        notas: notas?.trim() || "",
        creadoPor: user._id,
        creadoPorTipo: user.role,
        clienteId: user.role === "user" ? user._id : null,
      };

      const solicitud = await SaludMentalService.crearSolicitud(payload);
      return res.status(201).json({ message: "✅ Solicitud registrada correctamente", solicitud });
    } catch (err) {
      console.error("❌ Error crear solicitud:", err);
      return res.status(500).json({ message: err.message || "Error creando solicitud" });
    }
  },

  async listarMisSolicitudes(req, res) {
    try {
      const user = req.user;
      const solicitudes = await SaludMentalService.listarPorCliente(user._id);
      return res.json(solicitudes);
    } catch (err) {
      console.error("❌ Error listarMisSolicitudes:", err);
      return res.status(500).json({ message: "Error listando mis solicitudes" });
    }
  },

  async listarTodas(req, res) {
    try {
      const solicitudes = await SaludMentalService.listarSolicitudes();
      return res.json(solicitudes);
    } catch (err) {
      console.error("❌ Error listarTodas:", err);
      return res.status(500).json({ message: "Error obteniendo solicitudes" });
    }
  },

  async setPresupuesto(req, res) {
    try {
      const user = req.user;
      const { id } = req.params;
      const { monto, detalle } = req.body;

      const payload = {
        monto,
        detalle: detalle?.trim() || "",
        autor: user._id,
        autorTipo: user.role,
      };

      const solicitud = await SaludMentalService.setPresupuesto(id, payload);
      return res.json({ message: "✅ Presupuesto guardado", solicitud });
    } catch (err) {
      console.error("❌ Error setPresupuesto:", err);
      return res.status(500).json({ message: err.message || "Error guardando presupuesto" });
    }
  },

  async cambiarEstado(req, res) {
    try {
      const user = req.user;
      const { id } = req.params;
      const { estado, nota } = req.body;

      const payload = {
        estado,
        nota: nota?.trim() || "",
        autor: user._id,
        autorTipo: user.role,
      };

      const solicitud = await SaludMentalService.cambiarEstado(id, payload);
      return res.json({ message: "✅ Estado actualizado", solicitud });
    } catch (err) {
      console.error("❌ Error cambiarEstado:", err);
      return res.status(500).json({ message: err.message || "Error actualizando estado" });
    }
  },

  async notificarTurnos(req, res) {
    try {
      const user = req.user;
      const { id } = req.params;

      const payload = { autor: user._id, autorTipo: user.role };
      const solicitud = await SaludMentalService.notificarTurnos(id, payload);
      return res.json({ message: "📨 Notificación enviada al área de turnos", solicitud });
    } catch (err) {
      console.error("❌ Error notificarTurnos:", err);
      return res.status(500).json({ message: err.message || "Error notificando a turnos" });
    }
  },
};
