
import { IsString } from 'class-validator';

export class CreatePresupuestoDto {
  @IsString() empleadoApellido: string;
  @IsString() empleadoNombre: string;
  @IsString() celular: string;

  @IsString() motivo: string; // ✔

  @IsString() detalles: string;

  // ✔ agregado para quedar profesional
  @IsString() tipoServicio: string;

  @IsString() urgencia: string; // normal | urgente
}
