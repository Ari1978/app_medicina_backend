import { IsString } from 'class-validator';

export class CreateAdjuntoDto {
  @IsString()
  turnoId: string;

  @IsString()
  codigoPractica: string;

  @IsString()
  tipoServicio: string;

  @IsString()
  path: string;

  @IsString()
  mimeType: string;

  @IsString()
  usuarioId: string;

  @IsString()
  origen: 'servicio' | 'medico' | 'staff';
}
