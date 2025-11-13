export class TurnoDTO {
  constructor(turno) {
    this.id = turno._id?.toString() || "";
    this.userId = turno.user?._id?.toString() || turno.user?.toString() || "";

    // 👷 Empleado
    this.empleado = {
      nombre: turno.empleado?.nombre || "",
      apellido: turno.empleado?.apellido || "",
      dni: turno.empleado?.dni || "",
    };

    // 🏢 Empresa
    this.empresa = turno.user?.empresa || "";
    this.cuit = turno.user?.cuit || "";

    // 📋 Puesto y examenes
    this.puesto = turno.puesto || "";
    this.examenes = turno.examenes?.length
      ? turno.examenes.join(", ")
      : "Sin especificar";

    // 🧭 Tipo de examen (según códigos)
    this.motivoCodigo = turno.motivo || null;
    this.motivoDescripcion = this.getMotivoDescripcion(turno.motivo);

    // ☎️ Contacto
    this.contacto = {
      nombre: turno.contacto?.nombre || "",
      celular: turno.contacto?.celular || "",
    };

    // 📅 Fechas
    this.fecha = turno.fecha || "";
    this.hora = turno.hora || "";
    this.provisional = turno.provisional || false;
    this.confirmado = turno.confirmado || false;
    this.createdAt = turno.createdAt
      ? new Date(turno.createdAt).toISOString()
      : null;
    this.updatedAt = turno.updatedAt
      ? new Date(turno.updatedAt).toISOString()
      : null;
  }

  // 🔍 Mapeo de códigos de motivo → descripción legible
  getMotivoDescripcion(codigo) {
    const motivos = {
      "05": "Ingreso",
      "06": "Egreso",
      "07": "Egreso",
      "22": "Estudios",
      "31": "Complementario",
      "57": "Pendiente",
    };
    return motivos[codigo] || "Otro";
  }
}
