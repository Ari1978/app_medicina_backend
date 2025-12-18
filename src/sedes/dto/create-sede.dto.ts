// src/sede/dto/create-sede.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateSedeDto {
  @ApiProperty({
    example: 'Sede Central',
    description: 'Nombre identificatorio de la sede',
  })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({
    example: 'Buenos Aires',
    description: 'Provincia donde se encuentra la sede',
  })
  @IsString()
  @IsNotEmpty()
  provincia: string;

  @ApiProperty({
    example: 'La Matanza',
    description: 'Partido de la sede',
  })
  @IsString()
  @IsNotEmpty()
  partido: string;

  @ApiProperty({
    example: 'San Justo',
    description: 'Localidad de la sede',
  })
  @IsString()
  @IsNotEmpty()
  localidad: string;

  @ApiProperty({
    example: 'Av. Juan Manuel de Rosas 1234',
    description: 'Dirección completa de la sede',
  })
  @IsString()
  @IsNotEmpty()
  direccion: string;

  @ApiProperty({
    example: '11-4567-8901',
    description: 'Teléfono principal de contacto',
  })
  @IsString()
  @IsNotEmpty()
  telefono1: string;

  @ApiPropertyOptional({
    example: '11-4000-1234',
    description: 'Teléfono secundario (opcional)',
  })
  @IsOptional()
  @IsString()
  telefono2?: string;

  @ApiProperty({
    example: 'Lunes a Viernes de 08:00 a 17:00',
    description: 'Horarios de atención de la sede',
  })
  @IsString()
  @IsNotEmpty()
  horarios: string;
}
