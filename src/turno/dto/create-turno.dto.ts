import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsArray,
  ValidateIf,
} from 'class-validator';

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTurnoDto {
  // ============================
  // TIPO
  // ============================
  @ApiProperty({
    enum: ['examen', 'estudios'],
    example: 'examen',
    description: 'Tipo de turno',
  })
  @IsEnum(['examen', 'estudios'])
  tipo: string;

  // ============================
  // EMPLEADO
  // ============================
  @ApiProperty({ example: 'Juan' })
  @IsString()
  @IsNotEmpty()
  empleadoNombre: string;

  @ApiProperty({ example: 'Pérez' })
  @IsString()
  @IsNotEmpty()
  empleadoApellido: string;

  @ApiProperty({ example: '30123456' })
  @IsString()
  @IsNotEmpty()
  empleadoDni: string;

  @ApiProperty({ example: 'Operario' })
  @IsString()
  @IsNotEmpty()
  puesto: string;

  // ============================
  // MOTIVO UNIFICADO
  // ============================
  @ApiProperty({
    example: 'Ingreso',
    description: 'Motivo del turno (ingreso, periódico, egreso, etc.)',
  })
  @IsString()
  @IsNotEmpty()
  @ValidateIf(o => o.tipo === 'examen' || o.tipo === 'estudios')
  motivo: string;

  // ============================
  // PERFIL EXAMEN
  // ============================
  @ApiPropertyOptional({
    example: 'Administrativo',
    description: 'Perfil de examen (solo para tipo examen)',
  })
  @ValidateIf(o => o.tipo === 'examen')
  @IsOptional()
  @IsString()
  perfilExamen?: string;

  @ApiPropertyOptional({
    example: ['Audiometría', 'Espirometría'],
    description: 'Estudios adicionales (solo para examen)',
  })
  @ValidateIf(o => o.tipo === 'examen')
  @IsOptional()
  @IsArray()
  estudiosAdicionales?: string[];

  // ============================
  // LISTA ESTUDIOS
  // ============================
  @ApiPropertyOptional({
    example: ['Radiografía de tórax', 'Laboratorio'],
    description: 'Lista de estudios (solo para tipo estudios)',
  })
  @ValidateIf(o => o.tipo === 'estudios')
  @IsArray()
  @IsNotEmpty()
  listaEstudios?: string[];

  // ============================
  // FECHA / HORA
  // ============================
  @ApiProperty({ example: '2025-02-10' })
  @IsString()
  @IsNotEmpty()
  fecha: string;

  @ApiProperty({ example: '09:00' })
  @IsString()
  @IsNotEmpty()
  hora: string;

  // ============================
  // SOLICITANTE
  // ============================
  @ApiProperty({ example: 'María' })
  @IsString()
  @IsNotEmpty()
  solicitanteNombre: string;

  @ApiProperty({ example: 'Gómez' })
  @IsString()
  @IsNotEmpty()
  solicitanteApellido: string;

  @ApiProperty({ example: '1123456789' })
  @IsString()
  @IsNotEmpty()
  solicitanteCelular: string;
}
