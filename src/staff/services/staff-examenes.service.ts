import { Injectable } from '@nestjs/common';
import { TurnoService } from '../../turno/turno.service';

@Injectable()
export class StaffExamenesService {
  constructor(private readonly turnoService: TurnoService) {}

  // ===============================
  // DASHBOARD PRINCIPAL
  // ===============================
  async obtenerDashboard() {
    const hoy = new Date().toISOString().split('T')[0];

    const totalHoy = await this.turnoService.contarPorFecha(hoy);

    // pendiente = confirmado
    const pendientes = await this.turnoService.contarPorEstado('confirmado');

    // completado = realizado
    const completados = await this.turnoService.contarPorEstado('realizado');

    const proximos = await this.turnoService.listarProximosTurnos(5);

    return {
      resumen: {
        totalHoy,
        pendientes,
        completados,
      },
      proximos,
    };
  }

  // ===============================
  // EXÁMENES DEL DÍA
  // ===============================
  async listarHoy() {
    const hoy = new Date().toISOString().split('T')[0];
    const confirmados = await this.turnoService.listarExamenesConfirmados();
    return confirmados.filter(t => t.fecha === hoy);
  }

  // ===============================
  // TODOS LOS EXÁMENES CONFIRMADOS
  // ===============================
  listarConfirmados() {
    return this.turnoService.listarExamenesConfirmados();
  }

  // ===============================
  // SUBIR PDF
  // ===============================
  cargarPdf(id: string, url: string) {
    return this.turnoService.cargarPDF(id, url);
  }

  // ===============================
  // DETALLE DEL EXAMEN
  // ===============================
  detalle(id: string) {
    return this.turnoService.buscarPorId(id);
  }
}
