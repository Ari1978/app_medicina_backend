// src/formularios/presupuesto/dto/create-presupuesto.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail } from 'class-validator';

export class CreatePresupuestoDto {
  @ApiProperty({
    example: 'Rodríguez',
    description: 'Apellido del empleado',
  })
  @IsString()
  empleadoApellido: string;

  @ApiProperty({
    example: 'Carlos',
    description: 'Nombre del empleado',
  })
  @IsString()
  empleadoNombre: string;

  @ApiProperty({
    example: '11-6789-4321',
    description: 'Celular de contacto',
  })
  @IsString()
  celular: string;

  @ApiProperty({
    example: 'carlos.rodriguez@empresa.com',
    description: 'Email de contacto',
  })
  @IsEmail()
  emailContacto: string;

  @ApiProperty({
    example: 'Examen preocupacional',
    description: 'Motivo del presupuesto',
  })
  @IsString()
  motivo: string;

  @ApiProperty({
    example: 'Empleado administrativo con tareas de oficina',
    description: 'Detalles adicionales del pedido',
  })
  @IsString()
  detalles: string;

  @ApiProperty({
    example: 'Exámenes médicos laborales',
    description: 'Tipo de servicio solicitado',
  })
  @IsString()
  tipoServicio: string;

  @ApiProperty({
    example: 'Alta',
    description: 'Nivel de urgencia del servicio',
  })
  @IsString()
  urgencia: string;
}
