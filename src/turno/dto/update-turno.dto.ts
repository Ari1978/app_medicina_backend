import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  ValidateNested,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ============================
// PRÁCTICA A ACTUALIZAR
// ============================
export class PracticaResultadoDto {
  @ApiProperty({
    example: '503',
    description: 'Código de la práctica',
  })
  @IsString()
  @IsNotEmpty()
  codigo: string;

  @ApiProperty({
    enum: ['pendiente', 'realizado'],
    example: 'realizado',
  })
  @IsEnum(['pendiente', 'realizado'])
  estado: 'pendiente' | 'realizado';
}

// ============================
// ACTUALIZAR RESULTADOS DEL TURNO
// ============================
export class UpdateResultadosTurnoDto {
  // ============================
  // PRÁCTICAS (ACTUALIZA ESTADO)
  // ============================
  @ApiProperty({
    type: [PracticaResultadoDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PracticaResultadoDto)
  practicas: PracticaResultadoDto[];

  // ============================
  // PDF RESULTADO FINAL
  // ============================
  @ApiPropertyOptional({
    example: 'https://storage.asmellab.com/resultados/turno123.pdf',
  })
  @IsOptional()
  @IsString()
  pdfResultado?: string;

  // ============================
  // ESTADO GENERAL DEL TURNO
  // ============================
  @ApiPropertyOptional({
    enum: ['confirmado', 'atendido'],
    example: 'atendido',
  })
  @IsOptional()
  @IsEnum(['confirmado', 'atendido'])
  estado?: 'confirmado' | 'atendido';
}
