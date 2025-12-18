// src/formularios/turno-especial/dto/create-turno-especial.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsBooleanString, IsEmail } from 'class-validator';

export class CreateTurnoEspecialDto {
  @ApiProperty({
    example: 'Pérez',
    description: 'Apellido del empleado',
  })
  @IsString()
  empleadoApellido: string;

  @ApiProperty({
    example: 'Lucas',
    description: 'Nombre del empleado',
  })
  @IsString()
  empleadoNombre: string;

  @ApiProperty({
    example: '30123456',
    description: 'DNI del empleado',
  })
  @IsString()
  empleadoDni: string;

  @ApiProperty({
    example: 'Operario de Depósito',
    description: 'Puesto del empleado',
  })
  @IsString()
  puesto: string;

  @ApiProperty({
    example: 'true',
    description: 'Indica si el puesto contempla tareas livianas (boolean como string)',
  })
  @IsBooleanString()
  tareasLivianas: string;

  @ApiProperty({
    example: 'false',
    description: 'Indica si el empleado recibió asesoramiento previo (boolean como string)',
  })
  @IsBooleanString()
  recibioAsesoramiento: string;

  @ApiProperty({
    example: 'true',
    description: 'Indica si el turno tiene carácter urgente (boolean como string)',
  })
  @IsBooleanString()
  urgencia: string;

  @ApiProperty({
    example: 'Reubicación laboral',
    description: 'Motivo del turno especial',
  })
  @IsString()
  motivo: string;

  @ApiProperty({
    example: 'Empleado con restricción temporal por lesión',
    description: 'Detalles adicionales del pedido',
  })
  @IsString()
  detalles: string;

  @ApiProperty({
    example: 'Ana Martínez',
    description: 'Nombre de la persona que solicita el turno',
  })
  @IsString()
  solicitadoPorNombre: string;

  @ApiProperty({
    example: '11-7890-4567',
    description: 'Celular de la persona solicitante',
  })
  @IsString()
  solicitadoPorCelular: string;

  @ApiProperty({
    example: 'ana.martinez@empresa.com',
    description: 'Email de contacto',
  })
  @IsEmail()
  emailContacto: string;
}
