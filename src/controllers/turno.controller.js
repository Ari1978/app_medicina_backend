import { TurnoService } from "../services/turno.service.js";
import XLSX from "xlsx";
import fs from "fs";
import path from "path";

export const TurnoController = {
  // ✅ Listar todos los turnos confirmados (filtrando por fecha)
  async listarTodosConfirmados(req, res) {
    try {
      const { fecha } = req.query;
      const filter = fecha ? { confirmado: true, fecha } : { confirmado: true };
      const turnos = await TurnoService.listarPorFiltro(filter);
      return res.json(turnos);
    } catch (err) {
      console.error("❌ listarTodosConfirmados:", err);
      return res
        .status(500)
        .json({ message: "Error listando turnos confirmados" });
    }
  },

  // ✅ Turnos confirmados del usuario (si los necesita)
  async listarMisConfirmados(req, res) {
    try {
      const empresaId = req.user._id;
      const { fecha } = req.query;
      const filter = fecha
        ? { user: empresaId, confirmado: true, fecha }
        : { user: empresaId, confirmado: true };

      const turnos = await TurnoService.listarPorFiltro(filter);
      return res.json(turnos);
    } catch (err) {
      console.error("❌ listarMisConfirmados:", err);
      return res
        .status(500)
        .json({ message: "Error listando mis turnos confirmados" });
    }
  },

  // ✅ Listar provisionales
  async listarProvisionales(req, res) {
    try {
      const empresaId = req.user._id;
      const fecha = req.query?.fecha;
      const filter = fecha
        ? { user: empresaId, provisional: true, confirmado: false, fecha }
        : { user: empresaId, provisional: true, confirmado: false };

      const turnos = await TurnoService.listarPorFiltro(filter);
      return res.json(turnos);
    } catch (err) {
      console.error("❌ listarProvisionales:", err);
      return res
        .status(500)
        .json({ message: "Error al listar turnos provisionales" });
    }
  },

  // ✅ Crear turno provisional
  async crearProvisional(req, res) {
    try {
      const actor = req.user;
      const turno = await TurnoService.crearTurno(req.body, {
        autor: actor._id,
        autorTipo: actor.role,
      });
      return res.status(201).json(turno);
    } catch (err) {
      console.error("❌ crearProvisional:", err);
      return res
        .status(500)
        .json({ message: err.message || "Error al crear turno provisional" });
    }
  },

  // ✅ Confirmar
  async confirmar(req, res) {
    try {
      const actor = req.user;
      const turnoId = req.params.id;
      const turno = await TurnoService.confirmarTurno(turnoId, {
        autor: actor._id,
        autorTipo: actor.role,
      });
      return res.json(turno);
    } catch (err) {
      console.error("❌ confirmar:", err);
      return res
        .status(500)
        .json({ message: err.message || "Error al confirmar turno" });
    }
  },

  // ✅ Actualizar
  async actualizar(req, res) {
    try {
      const actor = req.user;
      const turnoId = req.params.id;
      const turno = await TurnoService.actualizarTurno(turnoId, req.body, {
        autor: actor._id,
        autorTipo: actor.role,
      });
      return res.json(turno);
    } catch (err) {
      console.error("❌ actualizar:", err);
      return res
        .status(500)
        .json({ message: err.message || "Error al actualizar turno" });
    }
  },

  // ✅ Eliminar
  async eliminar(req, res) {
    try {
      const actor = req.user;
      const turnoId = req.params.id;
      const resultado = await TurnoService.eliminarTurno(turnoId, {
        autor: actor._id,
        autorTipo: actor.role,
      });
      return res.json({ message: "🗑️ Turno eliminado", ...resultado });
    } catch (err) {
      console.error("❌ eliminar:", err);
      return res
        .status(500)
        .json({ message: err.message || "Error al eliminar turno" });
    }
  },

  // ✅ Exportar turnos del día actual a Excel con “Tipo” y totales
  async exportarTurnosExcel(req, res) {
    try {
      const hoy = new Date();
      const fechaStr = hoy.toISOString().split("T")[0];

      // 🔹 Buscar turnos confirmados del día actual
      const turnos = await TurnoService.listarPorFiltro({
        fecha: fechaStr,
        confirmado: true,
      });

      if (!turnos.length)
        return res
          .status(404)
          .json({ message: "No hay turnos confirmados hoy" });

      // 🔹 Mapear códigos de motivo
      const motivosMap = {
        "05": "Ingreso",
        "06": "Egreso",
        "07": "Egreso",
        "22": "Periódico",
        "57": "Pendiente",
        "31": "Complementario",
      };

      // 🔹 Contadores de estudios
      const totales = {
        espirometria: 0,
        psicotecnico: 0,
        audiometria: 0,
        electroencefalograma: 0,
        ergometria: 0,
      };

      // 🔹 Crear dataset para Excel
      const data = turnos.map((t, i) => {
        const examenes = (t.examenes || []).join(", ").toLowerCase();
        const motivo = t.motivo || "";
        const motivoDesc = motivosMap[motivo] || "Otro";

        // Si el motivo es ingreso, egreso o periódico → Tipo "Básico"
        let tipo = "";
        if (["05", "06", "07", "22"].includes(motivo)) tipo = "Básico";

        // Contar estudios
        if (examenes.includes("espiro")) totales.espirometria++;
        if (examenes.includes("psico")) totales.psicotecnico++;
        if (examenes.includes("audio")) totales.audiometria++;
        if (examenes.includes("electro")) totales.electroencefalograma++;
        if (examenes.includes("ergo")) totales.ergometria++;

        return {
          "N°": i + 1,
          "Apellido y Nombre": `${t.empleado?.apellido || ""} ${
            t.empleado?.nombre || ""
          }`,
          "DNI": t.empleado?.dni || "",
          "Motivo": motivoDesc,
          "Tipo": tipo,
          "Estudios": (t.examenes || []).join(", "),
          "Empresa": t.user?.empresa || "",
          "Hora": t.hora || "",
        };
      });

      // 🔹 Crear libro Excel
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Turnos del Día");

      // 🔹 Totales al final del Excel
      const resumen = [
        [],
        ["", "TOTAL DE TURNOS", turnos.length],
        ["", "Espirometrías", totales.espirometria],
        ["", "Psicotécnicos", totales.psicotecnico],
        ["", "Audiometrías", totales.audiometria],
        ["", "Electroencefalogramas", totales.electroencefalograma],
        ["", "Ergometrías", totales.ergometria],
      ];

      XLSX.utils.sheet_add_aoa(ws, resumen, { origin: -1 });

      // 🔹 Guardar temporal y enviar archivo
      const dir = path.join(process.cwd(), "tmp");
      if (!fs.existsSync(dir)) fs.mkdirSync(dir);

      const filePath = path.join(dir, `Turnos_${fechaStr}.xlsx`);
      XLSX.writeFile(wb, filePath);

      res.download(filePath, `Turnos_${fechaStr}.xlsx`, (err) => {
        if (err) console.error("❌ Error al enviar archivo:", err);
        fs.unlink(filePath, () => {}); // limpiar archivo temporal
      });
    } catch (err) {
      console.error("❌ exportarTurnosExcel:", err);
      return res.status(500).json({
        message: "Error exportando turnos",
        error: err.message,
      });
    }
  },
};
