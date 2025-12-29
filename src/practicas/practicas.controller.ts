import { Controller, Get } from '@nestjs/common';
import { PracticasService } from './practicas.service';
import { CATALOGO_PRACTICAS } from './practicas.catalog';

@Controller('practicas')
export class PracticasController {
  constructor(private readonly practicasService: PracticasService) {}

  /**
   * Lista prácticas persistidas (si las usás en DB)
   */
  @Get()
  listar() {
    return this.practicasService.listar();
  }

  /**
   * Catálogo estático de prácticas
   * Fuente única de verdad
   */
  @Get('catalogo')
  obtenerCatalogo() {
    return CATALOGO_PRACTICAS.map((p) => ({
      codigo: p.codigo,
      nombre: p.nombre,
      sector: p.sector,
    }));
  }
}
