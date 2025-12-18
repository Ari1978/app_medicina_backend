// src/sede/dto/update-sede.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class UpdateSedeDto {
  @ApiPropertyOptional({
    example: 'Sede Norte',
    description: 'Nombre identificatorio de la sede',
  })
  @IsOptional()
  @IsString()
  nombre?: string;

  @ApiPropertyOptional({
    example: 'Buenos Aires',
    description: 'Provincia donde se encuentra la sede',
  })
  @IsOptional()
  @IsString()
  provincia?: string;

  @ApiPropertyOptional({
    example: 'Vicente López',
    description: 'Partido de la sede',
  })
  @IsOptional()
  @IsString()
  partido?: string;

  @ApiPropertyOptional({
    example: 'Olivos',
    description: 'Localidad de la sede',
  })
  @IsOptional()
  @IsString()
  localidad?: string;

  @ApiPropertyOptional({
    example: 'Av. Maipú 2500',
    description: 'Dirección completa de la sede',
  })
  @IsOptional()
  @IsString()
  direccion?: string;

  @ApiPropertyOptional({
    example: '11-5555-1234',
    description: 'Teléfono principal de contacto',
  })
  @IsOptional()
  @IsString()
  telefono1?: string;

  @ApiPropertyOptional({
    example: '11-4444-9876',
    description: 'Teléfono secundario',
  })
  @IsOptional()
  @IsString()
  telefono2?: string;

  @ApiPropertyOptional({
    example: 'Lunes a Viernes de 07:00 a 16:00',
    description: 'Horarios de atención de la sede',
  })
  @IsOptional()
  @IsString()
  horarios?: string;
}
