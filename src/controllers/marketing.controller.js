import { MarketingService } from "../services/marketing.service.js";

export const MarketingController = {
  async crear(req, res) {
    try {
      const user = req.user;
      if (!user) return res.status(401).json({ message: "No autenticado" });

      const { motivoConsulta, descripcion } = req.body;
      if (!motivoConsulta?.trim()) return res.status(400).json({ message: "motivoConsulta es requerido" });

      const payload = {
        motivoConsulta: motivoConsulta.trim(),
        descripcion: descripcion?.trim() || "",
        creadoPor: user._id,
        creadoPorTipo: user.role,
        clienteId: user.role === "user" ? user._id : null,
      };

      const doc = await MarketingService.crearSolicitud(payload);
      return res.status(201).json({ message: "✅ Solicitud creada correctamente", solicitud: doc });
    } catch (err) {
      console.error("❌ Error crear solicitud:", err);
      return res.status(500).json({ message: err.message || "Error creando solicitud" });
    }
  },

  async listar(req, res) {
    try {
      const { estado } = req.query;
      const list = await MarketingService.listarSolicitudes({ estado });
      return res.json(list);
    } catch (err) {
      console.error("❌ Error listar solicitudes:", err);
      return res.status(500).json({ message: "Error obteniendo solicitudes" });
    }
  },

  async detalle(req, res) {
    try {
      const doc = await MarketingService.obtenerDetalle(req.params.id);
      if (!doc) return res.status(404).json({ message: "No encontrada" });
      return res.json(doc);
    } catch (err) {
      console.error("❌ Error detalle:", err);
      return res.status(500).json({ message: "Error obteniendo detalle" });
    }
  },

  async presupuesto(req, res) {
    try {
      const user = req.user;
      const { monto, detalle, enviadoAlCliente } = req.body;

      const payload = { monto, detalle: detalle?.trim() || "", enviadoAlCliente: enviadoAlCliente ?? false, autor: user._id, autorTipo: user.role };
      const doc = await MarketingService.actualizarPresupuesto(req.params.id, payload);

      return res.json({ message: "✅ Presupuesto actualizado", solicitud: doc });
    } catch (err) {
      console.error("❌ Error actualizar presupuesto:", err);
      return res.status(500).json({ message: err.message || "Error actualizando presupuesto" });
    }
  },

  async cambiarEstado(req, res) {
    try {
      const user = req.user;
      const { estado, nota } = req.body;
      const payload = { estado, nota: nota?.trim() || "", autor: user._id, autorTipo: user.role };
      const doc = await MarketingService.cambiarEstado(req.params.id, payload);

      return res.json({ message: "✅ Estado actualizado", solicitud: doc });
    } catch (err) {
      console.error("❌ Error cambiar estado:", err);
      return res.status(500).json({ message: err.message || "Error cambiando estado" });
    }
  },

  async comentar(req, res) {
    try {
      const user = req.user;
      const { mensaje } = req.body;
      if (!mensaje?.trim()) return res.status(400).json({ message: "mensaje es requerido" });

      const payload = { mensaje: mensaje.trim(), autor: user._id, autorTipo: user.role };
      const doc = await MarketingService.agregarComentario(req.params.id, payload);

      return res.json({ message: "💬 Comentario agregado", solicitud: doc });
    } catch (err) {
      console.error("❌ Error agregar comentario:", err);
      return res.status(500).json({ message: err.message || "Error agregando comentario" });
    }
  },
};
