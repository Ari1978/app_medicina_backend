// src/services/turno.service.js
import { TurnoRepository } from "../repositories/turno.repository.js";

export const TurnoService = {
  /* =====================================================
     🔹 CREAR PROVISIONAL
  ===================================================== */
  async crearTurno(data, { autor, autorTipo }) {
    if (!data) throw new Error("Datos inválidos");
    if (!data.fecha || !data.hora) throw new Error("Faltan fecha u hora");

    // Empresa: para usuario es req.user._id, para staff viene en req.body
    const empresa = data.user || data.empresaId;
    if (!empresa) throw new Error("Falta empresaId");

    const turnoData = {
      ...data,
      user: empresa,
      empresaId: empresa,

      // NUEVA LÓGICA CONSISTENTE
      estado: "provisional",

      // Compatibilidad con campos antiguos (tu app los usa en algunos lados)
      provisional: true,
      confirmado: false,

      // Trazabilidad
      creadoPor: autor,
      creadoPorTipo: autorTipo,
    };

    return await TurnoRepository.create(turnoData);
  },

  /* =====================================================
     🔹 CONFIRMAR UN TURNO
  ===================================================== */
  async confirmarTurno(turnoId, { autor, autorTipo }) {
    const turno = await TurnoRepository.findById(turnoId);
    if (!turno) throw new Error("Turno no encontrado");

    // Nueva lógica
    turno.estado = "confirmado";

    // Compatibilidad
    turno.provisional = false;
    turno.confirmado = true;

    // Trazabilidad
    turno.actualizadoPor = autor;
    turno.actualizadoPorTipo = autorTipo;

    // Repara dueño siempre (casos donde staff crea turno)
    if (!turno.user) turno.user = turno.empresaId;
    if (!turno.empresaId) turno.empresaId = turno.user;

    return await turno.save();
  },

  /* =====================================================
     🔹 ACTUALIZAR
  ===================================================== */
  async actualizarTurno(turnoId, data, { autor, autorTipo }) {
    const turno = await TurnoRepository.findById(turnoId);
    if (!turno) throw new Error("Turno no encontrado");

    Object.assign(turno, data, {
      actualizadoPor: autor,
      actualizadoPorTipo: autorTipo,
    });

    return await turno.save();
  },

  /* =====================================================
     🔹 ELIMINAR
  ===================================================== */
  async eliminarTurno(turnoId) {
    const turno = await TurnoRepository.findById(turnoId);
    if (!turno) throw new Error("Turno no encontrado");

    await turno.deleteOne();
    return { eliminado: true };
  },

  /* =====================================================
     🔹 LISTADOS
  ===================================================== */
  async listarPorFiltro(filter) {
    return await TurnoRepository.findByFilter(filter);
  },

  async listarTurnosConfirmadosPorUser(userId) {
    return await TurnoRepository.findConfirmadosByUser(userId);
  },

  async listarTurnosProvisionalesPorUser(userId) {
    return await TurnoRepository.findProvisionalesByUser(userId);
  },

  async listarTurnosPorUsuarioYFecha(userId, fecha) {
    return await TurnoRepository.findProvisionalesByUserAndDate(userId, fecha);
  },

  async confirmarTurnosUsuario(userId) {
    return await TurnoRepository.confirmarProvisionales(userId);
  },

  async listarTurnosPorFechaConfirmados(fecha) {
    return await TurnoRepository.findByFilter({
      fecha,
      estado: "confirmado",
    });
  },
};

