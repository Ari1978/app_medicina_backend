import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class EstudioResultadoDto {
  @ApiProperty({
    description: 'Nombre del estudio',
    example: 'Audiometría',
  })
  @IsString()
  nombre: string;

  @ApiProperty({
    description: 'Sector del estudio',
    example: 'Clínica',
  })
  @IsString()
  sector: string;

  @ApiProperty({
    description: 'Estado del estudio',
    enum: ['pendiente', 'realizado'],
    example: 'realizado',
  })
  @IsEnum(['pendiente', 'realizado'])
  estado: 'pendiente' | 'realizado';
}

export class UpdateResultadosTurnoDto {
  // ============================
  // ESTUDIOS (ESTADO OPERATIVO)
  // ============================
  @ApiProperty({
    description: 'Listado de estudios con estado actualizado',
    type: [EstudioResultadoDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EstudioResultadoDto)
  estudios: EstudioResultadoDto[];

  // ============================
  // PDF RESULTADO
  // ============================
  @ApiPropertyOptional({
    description: 'URL o ruta del PDF final del resultado',
    example: 'https://storage.asmellab.com/resultados/turno123.pdf',
  })
  @IsOptional()
  @IsString()
  pdfResultado?: string;

  // ============================
  // ESTADO GENERAL DEL TURNO
  // ============================
  @ApiPropertyOptional({
    description: 'Estado general del turno',
    enum: ['confirmado', 'realizado'],
    example: 'realizado',
  })
  @IsOptional()
  @IsEnum(['confirmado', 'realizado'])
  estado?: string;
}
