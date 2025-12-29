import { Injectable, Inject, forwardRef } from '@nestjs/common';

import { BlocksService } from './blocks.service';
import { FeriadosService } from './feriados.service';
import { AvailabilityCacheService } from './availability.cache.service';

import { TurnoService } from '../turno/turno.service';

@Injectable()
export class AvailabilityService {
  constructor(
    private readonly blocks: BlocksService,
    private readonly feriados: FeriadosService,
    private readonly cache: AvailabilityCacheService,

    @Inject(forwardRef(() => TurnoService))
    private readonly turnosService: TurnoService,
  ) {}

  // ============================================================
  // HELPERS
  // ============================================================
  private normalizarHora(hora: string): string {
    const [h, m] = hora.split(':');
    return `${h.padStart(2, '0')}:${m.padStart(2, '0')}`;
  }

  // ============================================================
  // DISPONIBILIDAD GLOBAL POR FECHA
  // ============================================================
  async getDisponibilidad(fecha: string) {
    const fechaLimpia = fecha.split('T')[0];
    const [y, m, d] = fechaLimpia.split('-').map(Number);
    const day = new Date(y, m - 1, d).getDay();

    const cacheKey = `dispo:${fechaLimpia}`;

    // ============================
    // CACHE
    // ============================
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;

    // ❌ Domingo
    if (day === 0) return [];

    // ❌ Feriado
    if (this.feriados.esFeriado(fechaLimpia)) return [];

    // ============================
    // CONFIGURACIÓN HORARIA
    // ============================
    let inicio = '07:00';
    let fin = '10:30';
    let cupos = 5;

    // Sábado
    if (day === 6) {
      inicio = '08:00';
      fin = '09:30';
      cupos = 3;
    }

    const bloques = this.blocks.generarBloques(inicio, fin, 15);

    // ============================
    // TURNOS DEL DÍA (FUENTE ÚNICA)
    // ============================
    const turnos = await this.turnosService.listarPorFechaGlobal(fechaLimpia);

    const disponibilidad = bloques.map((horaBloque) => {
      const horaNorm = this.normalizarHora(horaBloque);

      const ocupados = turnos.filter(
        (t) =>
          this.normalizarHora(t.hora) === horaNorm && t.estado !== 'cancelado',
      ).length;

      return {
        hora: horaNorm,
        capacidad: cupos,
        ocupados,
        libres: Math.max(cupos - ocupados, 0),
        disponible: ocupados < cupos,
      };
    });

    await this.cache.set(cacheKey, disponibilidad);
    return disponibilidad;
  }

  // ============================================================
  // INVALIDAR CACHE (CLAVE)
  // ============================================================
  async invalidateCache(fecha: string) {
    const fechaLimpia = fecha.split('T')[0];
    const cacheKey = `dispo:${fechaLimpia}`;
    await this.cache.del(cacheKey);
  }
}
