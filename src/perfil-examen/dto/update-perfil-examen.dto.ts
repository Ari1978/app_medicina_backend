// src/perfil-examen/dto/update-perfil-examen.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class EstudioUpdateDto {
  @ApiPropertyOptional({
    example: 'Radiografía de Tórax',
    description: 'Nombre del estudio',
  })
  @IsString()
  nombre: string;

  @ApiPropertyOptional({
    example: 'Diagnóstico por imágenes',
    description: 'Sector del estudio',
  })
  @IsString()
  sector: string;
}

export class UpdatePerfilExamenDto {
  @ApiPropertyOptional({
    example: 'Supervisor de Planta',
    description: 'Puesto de trabajo asociado al perfil',
  })
  @IsOptional()
  @IsString()
  puesto?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Indica si el perfil de examen está activo',
  })
  @IsOptional()
  @IsBoolean()
  activo?: boolean;

  @ApiPropertyOptional({
    type: [EstudioUpdateDto],
    description: 'Listado actualizado de estudios del perfil',
    example: [
      { nombre: 'Radiografía de Tórax', sector: 'Diagnóstico por imágenes' },
      { nombre: 'Electrocardiograma', sector: 'Cardiología' },
    ],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EstudioUpdateDto)
  estudios?: EstudioUpdateDto[];
}
