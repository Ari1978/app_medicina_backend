import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

import { ResultadoPracticaDto } from './resultado-practicas.dto';

export class EditResultadoFinalDto {
  // ============================
  // PRÁCTICAS EDITADAS
  // ============================
  @ApiPropertyOptional({
    type: [ResultadoPracticaDto],
    description: 'Listado de prácticas editadas',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResultadoPracticaDto)
  practicas?: ResultadoPracticaDto[];

  // ============================
  // APTITUD FINAL
  // ============================
  @ApiPropertyOptional({
    enum: ['A', 'B', 'C'],
  })
  @IsOptional()
  @IsEnum(['A', 'B', 'C'])
  aptitud?: 'A' | 'B' | 'C';

  // ============================
  // OBSERVACIÓN GENERAL
  // ============================
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  observacionGeneral?: string;
}
