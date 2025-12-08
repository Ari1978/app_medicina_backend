
import { IsString } from 'class-validator';

export class CreateEmpresaDto {
  @IsString()
  cuit: string;

  @IsString()
  razonSocial: string;
}
