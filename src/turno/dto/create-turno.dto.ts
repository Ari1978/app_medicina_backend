import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

// ============================
// PRÁCTICA DEL TURNO
// ============================
export class PracticaTurnoDto {
  @ApiProperty({ example: '503' })
  @IsString()
  @IsNotEmpty()
  codigo: string;

  @ApiProperty({ enum: ['pendiente', 'realizado'] })
  @IsEnum(['pendiente', 'realizado'])
  estado: 'pendiente' | 'realizado';
}

// ============================
// CREAR TURNO
// ============================
export class CreateTurnoDto {
  // ============================
  // TIPO
  // ============================
  @ApiProperty({
    enum: ['examen', 'estudios'],
    example: 'examen',
  })
  @IsEnum(['examen', 'estudios'])
  tipo: 'examen' | 'estudios';

  // ============================
  // MOTIVO
  // ============================
  @ApiProperty({
    example: 'ingreso',
  })
  @IsString()
  @IsNotEmpty()
  motivo: string;

  // ============================
  // PERFIL EXAMEN (opcional)
  // ============================
  @ApiPropertyOptional({
    example: '65fae123abc...',
    description: 'ID del perfil de examen',
  })
  @IsOptional()
  @IsString()
  perfilExamen?: string;

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

  // ============================
  // PRÁCTICAS DEL TURNO (FINAL)
  // ============================
  @ApiProperty({
    type: [PracticaTurnoDto],
    example: [
      { codigo: '201', estado: 'pendiente' },
      { codigo: '503', estado: 'pendiente' },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PracticaTurnoDto)
  listaPracticas: PracticaTurnoDto[];
}
