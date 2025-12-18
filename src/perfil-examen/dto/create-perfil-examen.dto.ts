// src/perfil-examen/dto/create-perfil-examen.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsArray,
  IsNotEmpty,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class EstudioDto {
  @ApiProperty({
    example: 'Audiometría',
    description: 'Nombre del estudio médico',
  })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({
    example: 'Clínico',
    description: 'Sector al que pertenece el estudio',
  })
  @IsString()
  @IsNotEmpty()
  sector: string;
}

export class CreatePerfilExamenDto {
  @ApiProperty({
    example: 'Operario Metalúrgico',
    description: 'Puesto de trabajo asociado al perfil de examen',
  })
  @IsString()
  @IsNotEmpty()
  puesto: string;

  @ApiProperty({
    type: [EstudioDto],
    description: 'Listado de estudios requeridos para el puesto',
    example: [
      { nombre: 'Audiometría', sector: 'Clínico' },
      { nombre: 'Espirometría', sector: 'Neumonología' },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EstudioDto)
  estudios: EstudioDto[];

  @ApiProperty({
    example: '64f123abc456def789012345',
    description: 'ID de la empresa a la que pertenece el perfil',
  })
  @IsString()
  @IsNotEmpty()
  empresaId: string;
}

