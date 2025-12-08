// src/formularios/dto/create-turno-especial.dto.ts

import { IsString, IsBoolean, IsIn } from "class-validator";

export class CreateTurnoEspecialDto {
  // DATOS DEL EMPLEADO
  @IsString()
  empleadoApellido: string;

  @IsString()
  empleadoNombre: string;

  @IsString()
  empleadoDni: string; 

  // SOLICITANTE
  @IsString()
  solicitadoPorNombre: string;

  @IsString()
  solicitadoPorCelular: string;

  // ¿RECIBIÓ ASESORAMIENTO MÉDICO?
  @IsBoolean()
  recibioAsesoramiento: boolean;

  // ¿ES URGENTE?
  @IsBoolean()
  urgencia: boolean;

  // MOTIVO
  @IsString()
  @IsIn(["Traumatología", "Psicología", "Psiquiatría", "Otro"])
  motivo: string;

  // TAREAS LIVIANAS
  @IsBoolean()
  tareasLivianas: boolean;

  // PUESTO
  @IsString()
  puesto: string;

  // DETALLES DEL CASO
  @IsString()
  detalles: string;
}
