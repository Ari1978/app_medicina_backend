import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

import { ResultadoPracticaDto } from './resultado-practicas.dto';

export class CreateResultadoFinalDto {
  // ============================
  // PRÁCTICAS / ESTUDIOS REALIZADOS
  // (nombre mantenido por compatibilidad)
  // ============================
  @ApiProperty({
    type: [ResultadoPracticaDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResultadoPracticaDto)
  practicas: ResultadoPracticaDto[];

  // ============================
  // APTITUD FINAL
  // ============================
  @ApiProperty({
    enum: ['A', 'B', 'C'],
  })
  @IsEnum(['A', 'B', 'C'])
  aptitud: 'A' | 'B' | 'C';

  // ============================
  // OBSERVACIÓN GENERAL (OPCIONAL)
  // ============================
  @ApiPropertyOptional({
    example: 'Apto sin restricciones',
  })
  @IsOptional()
  @IsString()
  observacionGeneral?: string;
}
