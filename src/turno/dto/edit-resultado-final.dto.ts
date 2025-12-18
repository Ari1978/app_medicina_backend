import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

import { ResultadoEstudioDto } from './resultado-estudio.dto';

export class EditResultadoFinalDto {
  @ApiPropertyOptional({
    type: [ResultadoEstudioDto],
    description: 'Listado de estudios editados',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResultadoEstudioDto)
  estudios?: ResultadoEstudioDto[];

  @ApiPropertyOptional({
    enum: ['A', 'B', 'C'],
    description: 'Aptitud final',
  })
  @IsOptional()
  @IsEnum(['A', 'B', 'C'])
  aptitud?: 'A' | 'B' | 'C';

  @ApiPropertyOptional({
    description: 'Observación general del resultado',
  })
  @IsOptional()
  @IsString()
  observacionGeneral?: string;
}
