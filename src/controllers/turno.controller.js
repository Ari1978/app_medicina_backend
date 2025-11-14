// src/controllers/turno.controller.js
import { TurnoService } from "../services/turno.service.js";
import XLSX from "xlsx";
import fs from "fs";
import path from "path";

export const TurnoController = {

  /* =====================================================
     🔵 LISTAR TODOS LOS CONFIRMADOS (STAFF / ADMIN)
  ===================================================== */
  async listarTodosConfirmados(req, res) {
    try {
      const { fecha } = req.query;

      const filter = fecha
        ? { estado: "confirmado", fecha }
        : { estado: "confirmado" };

      const turnos = await TurnoService.listarPorFiltro(filter);
      return res.json(turnos);
    } catch (err) {
      console.error("❌ listarTodosConfirmados:", err);
      return res.status(500).json({ message: "Error listando turnos confirmados" });
    }
  },

  /* =====================================================
     🔵 MIS TURNOS CONFIRMADOS (EMPRESA)
  ===================================================== */
  async listarMisConfirmados(req, res) {
    try {
      const userId = req.user._id.toString();
      const { fecha } = req.query;

      const filter = fecha
        ? { empresaId: userId, estado: "confirmado", fecha }
        : { empresaId: userId, estado: "confirmado" };

      const turnos = await TurnoService.listarPorFiltro(filter);
      return res.json(turnos);
    } catch (err) {
      console.error("❌ listarMisConfirmados:", err);
      return res.status(500).json({ message: "Error listando mis turnos confirmados" });
    }
  },

  /* =====================================================
     🔵 LISTAR PROVISIONALES (EMPRESA)
  ===================================================== */
  async listarProvisionales(req, res) {
    try {
      const userId = req.user._id.toString();
      const { fecha } = req.query;

      const filter = fecha
        ? { empresaId: userId, estado: "provisional", fecha }
        : { empresaId: userId, estado: "provisional" };

      const turnos = await TurnoService.listarPorFiltro(filter);
      return res.json(turnos);
    } catch (err) {
      console.error("❌ listarProvisionales:", err);
      return res.status(500).json({ message: "Error listando turnos provisionales" });
    }
  },

  /* =====================================================
     🔵 CREAR PROVISIONAL
  ===================================================== */
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
      return res.status(500).json({ message: err.message || "Error al crear turno provisional" });
    }
  },

  /* =====================================================
     🔵 CONFIRMAR TURNO
  ===================================================== */
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
      return res.status(500).json({ message: err.message || "Error al confirmar turno" });
    }
  },

  /* =====================================================
     🔵 ACTUALIZAR PROVISIONAL
  ===================================================== */
  async actualizar(req, res) {
    try {
      const actor = req.user;

      const turno = await TurnoService.actualizarTurno(
        req.params.id,
        req.body,
        { autor: actor._id, autorTipo: actor.role }
      );

      return res.json(turno);
    } catch (err) {
      console.error("❌ actualizar:", err);
      return res.status(500).json({ message: err.message || "Error al actualizar turno" });
    }
  },

  /* =====================================================
     🔵 ELIMINAR
  ===================================================== */
  async eliminar(req, res) {
    try {
      const actor = req.user;

      const result = await TurnoService.eliminarTurno(req.params.id, {
        autor: actor._id,
        autorTipo: actor.role,
      });

      return res.json({ message: "🗑️ Turno eliminado", ...result });
    } catch (err) {
      console.error("❌ eliminar:", err);
      return res.status(500).json({ message: err.message || "Error al eliminar turno" });
    }
  },

  /* =====================================================
     🔵 EXPORTAR EXCEL (STAFF / ADMIN)
  ===================================================== */
  async exportarTurnosExcel(req, res) {
    try {
      const hoy = new Date();
      const fechaStr = hoy.toISOString().split("T")[0];

      const turnos = await TurnoService.listarPorFiltro({
        fecha: fechaStr,
        estado: "confirmado",
      });

      if (!turnos.length) {
        return res.status(404).json({ message: "No hay turnos confirmados hoy" });
      }

      const motivosMap = {
        "05": "Ingreso",
        "06": "Egreso",
        "07": "Periódico",
        "22": "Estudios",
        "57": "Pendiente",
        "31": "Complementario",
      };

      const totales = {
        espirometria: 0,
        psicotecnico: 0,
        audiometria: 0,
        electroencefalograma: 0,
        ergometria: 0,
      };

      const data = turnos.map((t, i) => {
        const examenesTxt = (t.examenes || []).join(", ").toLowerCase();
        const motivoDesc = motivosMap[t.motivo] || "Otro";

        let tipo = "";
        if (["05", "06", "07", "22"].includes(t.motivo)) tipo = "Básico";

        if (examenesTxt.includes("espiro")) totales.espirometria++;
        if (examenesTxt.includes("psico")) totales.psicotecnico++;
        if (examenesTxt.includes("audio")) totales.audiometria++;
        if (examenesTxt.includes("electro")) totales.electroencefalograma++;
        if (examenesTxt.includes("ergo")) totales.ergometria++;

        return {
          "N°": i + 1,
          "Apellido y Nombre": `${t.empleado?.apellido || ""} ${t.empleado?.nombre || ""}`,
          DNI: t.empleado?.dni || "",
          Motivo: motivoDesc,
          Tipo: tipo,
          Estudios: (t.examenes || []).join(", "),
          Empresa: t.empresaId || "",
          Hora: t.hora || "",
        };
      });

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Turnos del Día");

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

      const dir = path.join(process.cwd(), "tmp");
      if (!fs.existsSync(dir)) fs.mkdirSync(dir);

      const filePath = path.join(dir, `Turnos_${fechaStr}.xlsx`);
      XLSX.writeFile(wb, filePath);

      res.download(filePath, `Turnos_${fechaStr}.xlsx`, (err) => {
        if (err) console.error("❌ Error al enviar archivo:", err);
        fs.unlink(filePath, () => {});
      });

    } catch (err) {
      console.error("❌ exportarTurnosExcel:", err);
      return res.status(500).json({ message: "Error exportando turnos", error: err.message });
    }
  },
};
