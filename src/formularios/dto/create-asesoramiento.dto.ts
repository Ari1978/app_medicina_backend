import { IsString, IsBoolean } from 'class-validator';

export class CreateAsesoramientoDto {
  @IsString()
  solicitanteNombre: string;

  @IsString()
  solicitanteCelular: string;

  @IsString()
  puesto: string;

  @IsString()
  tareas: string;

  @IsBoolean()
  tareasLivianas: boolean;

  @IsString()
  motivo: string;

  @IsString()
  detalles: string;
}
