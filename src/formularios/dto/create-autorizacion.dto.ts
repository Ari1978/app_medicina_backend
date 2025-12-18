// src/formularios/autorizacion/dto/create-autorizacion.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateAutorizacionDto {
  @ApiProperty({
    example: 'Gómez',
    description: 'Apellido del empleado',
  })
  @IsString()
  empleadoApellido: string;

  @ApiProperty({
    example: 'María',
    description: 'Nombre del empleado',
  })
  @IsString()
  empleadoNombre: string;

  @ApiProperty({
    example: 'Ingreso laboral',
    description: 'Motivo de la autorización',
  })
  @IsString()
  motivo: string;

  @ApiProperty({
    example: 'Dr. Juan López',
    description: 'Persona que autoriza',
  })
  @IsString()
  autorizadoPor: string;

  @ApiProperty({
    example: '11-5678-1234',
    description: 'Celular del solicitante',
  })
  @IsString()
  solicitanteCelular: string;

  @ApiProperty({
    example: 'Autorizado a realizar estudios complementarios',
    description: 'Aclaraciones adicionales',
  })
  @IsString()
  aclaraciones: string;
}
