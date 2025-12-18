import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ResultadoEstudioDto } from './resultado-estudio.dto';

export class CreateResultadoFinalDto {
  @ApiProperty({ type: [ResultadoEstudioDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResultadoEstudioDto)
  estudios: ResultadoEstudioDto[];

  @ApiProperty({ enum: ['A', 'B', 'C'] })
  @IsEnum(['A', 'B', 'C'])
  aptitud: 'A' | 'B' | 'C';

  @ApiProperty({ required: false })
  @IsString()
  observacionGeneral: string;
}
