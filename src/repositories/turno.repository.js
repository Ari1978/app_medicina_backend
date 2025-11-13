import Turno from "../models/turno.model.js";

export const TurnoRepository = {
  // 🔹 Crear un turno (provisional o confirmado)
  async create(data) {
    if (!data.creadoPor && data.user) {
      data.creadoPor = data.user;
      data.creadoPorTipo = "User";
    }
    if (!data.empresaId && data.user) {
      data.empresaId = data.user;
    }

    console.log("🧾 [TurnoRepository] Creando turno:", data);
    const turno = new Turno(data);
    return await turno.save();
  },

  // 🔹 Buscar por ID
  async findById(id) {
    return await Turno.findById(id);
  },

  // 🔹 Buscar todos confirmados
  async findAllConfirmados() {
    return await Turno.find({ confirmado: true })
      .sort({ fecha: 1, hora: 1 })
      .populate("user", "empresa cuit contacto.email")
      .lean();
  },

  // 🔹 Buscar confirmados por usuario
  async findConfirmadosByUser(userId) {
    return await Turno.find({ user: userId, confirmado: true })
      .sort({ fecha: 1, hora: 1 })
      .populate("user", "empresa cuit contacto.email")
      .lean();
  },

  // 🔹 Buscar provisionales por usuario
  async findProvisionalesByUser(userId) {
    return await Turno.find({
      user: userId,
      provisional: true,
      confirmado: false,
    })
      .sort({ fecha: 1, hora: 1 })
      .lean();
  },

  // 🔹 Buscar provisionales por usuario y fecha
  async findProvisionalesByUserAndDate(userId, fecha) {
    return await Turno.find({
      user: userId,
      provisional: true,
      confirmado: false,
      fecha,
    }).lean();
  },

  // 🔹 Eliminar un turno provisional
  async deleteProvisional(userId, turnoId) {
    const res = await Turno.deleteOne({
      _id: turnoId,
      user: userId,
      provisional: true,
      confirmado: false,
    });
    return res.deletedCount > 0;
  },

  // 🔹 Vaciar todos los turnos provisionales del usuario
  async clearProvisionales(userId) {
    return await Turno.deleteMany({
      user: userId,
      provisional: true,
      confirmado: false,
    });
  },

  // 🔹 Confirmar todos los turnos provisionales
  async confirmarProvisionales(userId) {
    return await Turno.updateMany(
      { user: userId, provisional: true, confirmado: false },
      { $set: { provisional: false, confirmado: true, estado: "confirmado" } }
    );
  },

  // ✅ Filtro genérico mejorado con populate
  async findByFilter(filter) {
    return await Turno.find(filter)
      .sort({ fecha: 1, hora: 1 })
      .populate("user", "empresa cuit contacto.email")
      .lean();
  },

  // ✅ Nuevo: listar confirmados por fecha (para exportar Excel)
  async findConfirmadosByFecha(fecha) {
    return await Turno.find({ fecha, confirmado: true })
      .sort({ hora: 1 })
      .populate("user", "empresa cuit contacto.email")
      .lean();
  },

  // 🔹 Buscar confirmados por fecha exacta
  async findConfirmadosByFecha(fecha) {
    return await Turno.find({ confirmado: true, fecha })
      .populate({ path: "user", select: "empresa cuit" })
      .sort({ hora: 1 })
      .lean();
  },
};
