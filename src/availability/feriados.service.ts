import { Injectable } from '@nestjs/common';
import feriadosJson from './feriados.json';

@Injectable()
export class FeriadosService {
  private readonly feriados: string[] = feriadosJson as unknown as string[];

  esFeriado(fecha: string): boolean {
    return this.feriados.includes(fecha);
  }
}
