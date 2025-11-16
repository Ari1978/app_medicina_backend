// src/services/turno.service.js
import { TurnoRepository } from "../repositories/turno.repository.js";

const normalizarTipo = (role) => {
  if (role === "user") return "User";
  if (role === "staff") return "Staff";
  if (role === "admin") return "Admin";
  return "User";
};

export const TurnoService = {
  /* =====================================================
     🔹 LISTAR POR FILTRO
  ===================================================== */
  async listarPorFiltro(filtro) {
    return await TurnoRepository.findByFilter(filtro);
  },

  /* =====================================================
     🔹 CREAR TURNO PROVISIONAL
  ===================================================== */
  async crearTurno(data, actor) {
    if (!data) throw new Error("Datos inválidos");

    const { fecha, hora, empleado, contacto, puesto, examenes = [], motivo } =
      data;

    if (!fecha || !hora) throw new Error("Falta fecha u hora");
    if (!empleado?.dni || !empleado?.nombre || !empleado?.apellido)
      throw new Error(
        "Faltan datos del empleado (nombre, apellido, dni)"
      );
    if (!contacto?.nombre || !contacto?.celular)
      throw new Error(
        "Faltan datos de contacto (nombre, celular)"
      );
    if (!puesto) throw new Error("Falta el puesto");

    // empresaId:
    // - si viene en data.empresaId → staff crea para esa empresa
    // - si no, empresa = actor.autor
    const empresaId = data.empresaId || actor?.autor;

    const turnoData = {
      fecha,
      hora,
      empleado,
      contacto,
      puesto,
      examenes,
      motivo: motivo || "57", // Pendiente

      user: empresaId,
      empresaId,

      creadoPor: actor?.autor || empresaId,
      creadoPorTipo: normalizarTipo(actor?.autorTipo || "user"),

      estado: "provisional",
      provisional: true,
      confirmado: false,
    };

    return await TurnoRepository.create(turnoData);
  },

  /* =====================================================
     🔹 CONFIRMAR UN TURNO
  ===================================================== */
  async confirmarTurno(turnoId, actor) {
    const turno = await TurnoRepository.findById(turnoId);
    if (!turno) throw new Error("Turno no encontrado");

    turno.estado = "confirmado";
    turno.provisional = false;
    turno.confirmado = true;

    // (si querés dejar trazabilidad de quién lo confirmó,
    // podés agregar campos extra acá en el modelo)

    return await turno.save();
  },

  /* =====================================================
     🔹 ACTUALIZAR
  ===================================================== */
  async actualizarTurno(turnoId, data, actor) {
    const turno = await TurnoRepository.findById(turnoId);
    if (!turno) throw new Error("Turno no encontrado");

    Object.assign(turno, data);

    // Si desde el front mandan estado "confirmado"
    if (data.estado === "confirmado") {
      turno.provisional = false;
      turno.confirmado = true;
    }

    return await turno.save();
  },

  /* =====================================================
     🔹 ELIMINAR
  ===================================================== */
  async eliminarTurno(turnoId, actor) {
    const turno = await TurnoRepository.findById(turnoId);
    if (!turno) throw new Error("Turno no encontrado");

    await turno.deleteOne();
    return { eliminado: true };
  },

  /* =====================================================
     🔹 LISTADOS
  ===================================================== */
  async listarTurnosConfirmadosPorUser(userId) {
    return await TurnoRepository.findConfirmadosByUser(userId);
  },

  async listarTurnosProvisionalesPorUser(userId) {
    return await TurnoRepository.findProvisionalesByUser(userId);
  },

  async confirmarTurnosUsuario(userId) {
    return await TurnoRepository.confirmarProvisionales(userId);
  },
};
