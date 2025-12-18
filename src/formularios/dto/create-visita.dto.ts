// src/formularios/visita/dto/create-visita.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreateVisitaDto {
  @ApiProperty({
    example: 'García',
    description: 'Apellido del empleado',
  })
  @IsString()
  empleadoApellido: string;

  @ApiProperty({
    example: 'Sofía',
    description: 'Nombre del empleado',
  })
  @IsString()
  empleadoNombre: string;

  @ApiProperty({
    example: '28999888',
    description: 'DNI del empleado',
  })
  @IsString()
  empleadoDni: string;

  @ApiPropertyOptional({
    example: 'Administrativo',
    description: 'Puesto del empleado (opcional)',
  })
  @IsOptional()
  @IsString()
  puesto?: string;

  @ApiProperty({
    example: 'Av. Siempre Viva 742',
    description: 'Dirección donde se realizará la visita',
  })
  @IsString()
  direccion: string;

  // ✅ GEO
  @ApiProperty({
    example: 'Buenos Aires',
    description: 'Provincia de la visita',
  })
  @IsString()
  provincia: string;

  @ApiProperty({
    example: 'Avellaneda',
    description: 'Partido de la visita',
  })
  @IsString()
  partido: string;

  @ApiProperty({
    example: 'Sarandí',
    description: 'Localidad de la visita',
  })
  @IsString()
  localidad: string;

  @ApiPropertyOptional({
    example: 'Evaluación de puesto',
    description: 'Motivo de la visita (opcional)',
  })
  @IsOptional()
  @IsString()
  motivo?: string;

  @ApiProperty({
    example: 'Carlos Méndez',
    description: 'Nombre del solicitante',
  })
  @IsString()
  solicitanteNombre: string;

  @ApiProperty({
    example: '11-3333-2222',
    description: 'Celular del solicitante',
  })
  @IsString()
  solicitanteCelular: string;
}
