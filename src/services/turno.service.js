import { TurnoRepository } from "../repositories/turno.repository.js";

export const TurnoService = {
  // 🔹 Crear turno (provisional o confirmado)
  async crearTurno(data, { autor, autorTipo }) {
    if (!data.fecha || !data.hora) throw new Error("Faltan fecha u hora");

    const turnoData = {
      ...data,
      empresaId: data.user,
      creadoPor: autor,
      creadoPorTipo: autorTipo,
      estado: data.provisional ? "provisional" : "confirmado",
    };

    return await TurnoRepository.create(turnoData);
  },

  // 🔹 Confirmar un turno individual
  async confirmarTurno(turnoId, { autor, autorTipo }) {
    const turno = await TurnoRepository.findById(turnoId);
    if (!turno) throw new Error("Turno no encontrado");

    turno.confirmado = true;
    turno.provisional = false;
    turno.estado = "confirmado";
    turno.actualizadoPor = autor;
    turno.actualizadoPorTipo = autorTipo;

    return await turno.save();
  },

  // 🔹 Actualizar turno
  async actualizarTurno(turnoId, data, { autor, autorTipo }) {
    const turno = await TurnoRepository.findById(turnoId);
    if (!turno) throw new Error("Turno no encontrado");

    Object.assign(turno, data, {
      actualizadoPor: autor,
      actualizadoPorTipo: autorTipo,
    });

    return await turno.save();
  },

  // 🔹 Eliminar turno
  async eliminarTurno(turnoId, { autor, autorTipo }) {
    const turno = await TurnoRepository.findById(turnoId);
    if (!turno) throw new Error("Turno no encontrado");

    await turno.deleteOne();
    return { eliminado: true };
  },

  // 🔹 Listar todos los confirmados (ya con filtro dinámico)
  async listarTodosConfirmados() {
    return await TurnoRepository.findAllConfirmados();
  },

  // 🔹 Listar por filtro (genérico)
  async listarPorFiltro(filter) {
    return await TurnoRepository.findByFilter(filter);
  },

  // 🔹 Listar confirmados por usuario
  async listarTurnosConfirmadosPorUser(userId) {
    return await TurnoRepository.findConfirmadosByUser(userId);
  },

  // 🔹 Listar provisionales por usuario
  async listarTurnosProvisionalesPorUser(userId) {
    return await TurnoRepository.findProvisionalesByUser(userId);
  },

  // 🔹 Listar provisionales por usuario y fecha
  async listarTurnosPorUsuarioYFecha(userId, fecha) {
    return await TurnoRepository.findProvisionalesByUserAndDate(userId, fecha);
  },

  // 🔹 Confirmar todos los turnos provisionales del usuario
  async confirmarTurnosUsuario(userId) {
    return await TurnoRepository.confirmarProvisionales(userId);
  },

  // 🔹 Listar turnos confirmados de una fecha específica (para exportación Excel)
  async listarTurnosPorFechaConfirmados(fecha) {
    return await TurnoRepository.findByFilter({ fecha, confirmado: true });
  },
};
