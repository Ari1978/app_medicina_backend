import { Injectable, BadRequestException } from '@nestjs/common';
import {
  CATALOGO_PRACTICAS,
  PracticaCatalogo,
} from './practicas.catalog';

@Injectable()
export class PracticasService {
  /**
   * Devuelve el catálogo completo de prácticas
   */
  listar(): PracticaCatalogo[] {
    return CATALOGO_PRACTICAS;
  }

  /**
   * Obtiene una práctica válida por código
   * Lanza error si el código no existe
   */
  obtenerPorCodigo(codigo: string): PracticaCatalogo {
    const practica = CATALOGO_PRACTICAS.find(
      (p) => p.codigo === codigo,
    );

    if (!practica) {
      throw new BadRequestException(
        `Práctica inválida: ${codigo}`,
      );
    }

    return practica;
  }

  /**
   * Valida una lista de códigos de prácticas
   * Se usa en perfiles y turnos
   */
  validarCodigos(codigos: string[]) {
    codigos.forEach((codigo) =>
      this.obtenerPorCodigo(codigo),
    );
  }

  // ============================================================
  // CATÁLOGO PARA IMPRESIÓN / AGRUPACIÓN POR SECTOR
  // ============================================================
  obtenerCatalogoParaImpresion(): PracticaCatalogo[] {
    // Es el mismo catálogo, sin DB
    return CATALOGO_PRACTICAS;
  }
}
