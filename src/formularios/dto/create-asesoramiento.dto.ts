// src/formularios/asesoramiento/dto/create-asesoramiento.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBooleanString,
  IsEmail,
} from 'class-validator';

export class CreateAsesoramientoDto {
  @ApiProperty({
    example: 'Juan Pérez',
    description: 'Nombre del solicitante',
  })
  @IsString()
  solicitanteNombre: string;

  @ApiProperty({
    example: '11-3456-7890',
    description: 'Celular del solicitante',
  })
  @IsString()
  solicitanteCelular: string;

  @ApiProperty({
    example: 'juan.perez@empresa.com',
    description: 'Email de contacto',
  })
  @IsEmail()
  emailContacto: string;

  @ApiProperty({
    example: 'Operario de Planta',
    description: 'Puesto de trabajo del solicitante',
  })
  @IsString()
  puesto: string;

  @ApiProperty({
    example: 'Manipulación de maquinaria pesada',
    description: 'Descripción de las tareas realizadas',
  })
  @IsString()
  tareas: string;

  @ApiProperty({
    example: 'true',
    description: 'Indica si el puesto contempla tareas livianas (boolean como string)',
  })
  @IsBooleanString()
  tareasLivianas: string;

  @ApiProperty({
    example: 'Ingreso de nuevo empleado',
    description: 'Motivo del asesoramiento',
  })
  @IsString()
  motivo: string;

  @ApiProperty({
    example: 'Se requiere evaluación ergonómica',
    description: 'Detalles adicionales del pedido',
  })
  @IsString()
  detalles: string;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Archivo adjunto (opcional)',
  })
  @IsOptional()
  archivo?: any;
}
