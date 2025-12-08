import { IsString } from 'class-validator';

export class CreateAutorizacionDto {
  @IsString()
  empleadoApellido: string;

  @IsString()
  empleadoNombre: string;

  @IsString()
  motivo: string;

  @IsString()
  autorizadoPor: string;

  @IsString()
  solicitanteCelular: string;

  @IsString()
  aclaraciones: string;
}
