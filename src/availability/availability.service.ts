import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Injectable, Inject, forwardRef } from '@nestjs/common';

import {
  Availability,
  AvailabilityDocument,
} from './schemas/availability.schema';

import { BlocksService } from './blocks.service';
import { FeriadosService } from './feriados.service';
import { AvailabilityCacheService } from './availability.cache.service';
import { AvailabilityEventsService } from './availability.events.service';

import { TurnoService } from '../turno/turno.service';

@Injectable()
export class AvailabilityService {
  constructor(
    private readonly blocks: BlocksService,
    private readonly feriados: FeriadosService,
    private readonly cache: AvailabilityCacheService,
    private readonly events: AvailabilityEventsService,

    @Inject(forwardRef(() => TurnoService))
    private readonly turnosService: TurnoService,

    @InjectModel(Availability.name)
    private readonly availabilityModel: Model<AvailabilityDocument>,
  ) {
    this.events.subscribe(({ fecha }) => {
      const key = `dispo:${fecha}`;
      this.cache.del(key);
    });
  }

  private normalizarHora(hora: string): string {
    const [h, m] = hora.split(':');
    return `${h.padStart(2, '0')}:${m.padStart(2, '0')}`;
  }

  // ✅ DISPONIBILIDAD GLOBAL
  async getDisponibilidad(fecha: string) {
    const fechaLimpia = fecha.split('T')[0];
    const fechaFix = new Date(fechaLimpia + 'T00:00:00');
    const day = fechaFix.getUTCDay();

    const key = `dispo:${fechaLimpia}`;

    const cached = await this.cache.get(key);
    if (cached) return cached;

    // ❌ Domingos
    if (day === 0) return [];

    // ❌ Feriados
    const fechaISO = fechaFix.toISOString().split('T')[0];
    if (this.feriados.esFeriado(fechaISO)) return [];

    // ✅ Config horarios
    let inicio = '07:00';
    let fin = '10:30';
    let cupos = 5;

    if (day === 6) {
      inicio = '08:00';
      fin = '09:30';
      cupos = 3;
    }

    const bloques = this.blocks.generarBloques(inicio, fin, 15);

    // ✅ TURNOS GLOBALES (NO por empresa)
    const turnos = await this.turnosService.listarPorFechaGlobal(fechaLimpia);

    const disponibilidad = bloques.map((bloqueHora) => {
      const horaNorm = this.normalizarHora(bloqueHora);

      const ocupados = turnos.filter(
        (t) =>
          this.normalizarHora(t.hora) === horaNorm &&
          t.estado !== 'cancelado',
      ).length;

      return {
        hora: horaNorm,
        capacidad: cupos,
        ocupados,
        libres: cupos - ocupados,
        disponible: ocupados < cupos,
      };
    });

    await this.cache.set(key, disponibilidad);
    return disponibilidad;
  }

  async bloquearTurno(fecha: string, hora: string) {
    let day = await this.availabilityModel.findOne({ fecha });

    if (!day) {
      day = await this.availabilityModel.create({
        fecha,
        cupos: {},
        bloqueados: [],
      });
    }

    if (!day.bloqueados.includes(hora)) {
      day.bloqueados.push(hora);
      await day.save();
    }
  }
}
