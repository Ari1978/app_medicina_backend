import {
  IsArray,
  IsEnum,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

import { ResultadoEstudioDto } from './resultado-estudio.dto';

export class CreateResultadoFinalDto {
  @ApiProperty({
    description: 'Resultados de cada estudio realizado',
    type: [ResultadoEstudioDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResultadoEstudioDto)
  estudios: ResultadoEstudioDto[];

  @ApiProperty({
    description: 'Aptitud final del empleado',
    enum: ['A', 'B', 'C'],
    example: 'A',
  })
  @IsEnum(['A', 'B', 'C'])
  aptitud: 'A' | 'B' | 'C';

  @ApiProperty({
    description: 'Observación general del médico',
    example: 'Apto sin restricciones',
  })
  @IsString()
  observacionGeneral: string;
}
