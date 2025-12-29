import {
  IsArray,
  IsEnum,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

import { ResultadoPracticaDto } from './resultado-practicas.dto';

export class CreateResultadoFinalDto {
  // ============================
  // PRÁCTICAS REALIZADAS
  // (se mantiene el nombre "estudios"
  // por compatibilidad con el sistema)
  // ============================
  @ApiProperty({
    description: 'Resultados de cada práctica realizada',
    type: [ResultadoPracticaDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResultadoPracticaDto)
  estudios: ResultadoPracticaDto[];

  // ============================
  // APTITUD FINAL
  // ============================
  @ApiProperty({
    description: 'Aptitud final del empleado',
    enum: ['A', 'B', 'C'],
    example: 'A',
  })
  @IsEnum(['A', 'B', 'C'])
  aptitud: 'A' | 'B' | 'C';

  // ============================
  // OBSERVACIÓN MÉDICA
  // ============================
  @ApiProperty({
    description: 'Observación general del médico',
    example: 'Apto sin restricciones',
  })
  @IsString()
  observacionGeneral: string;
}
