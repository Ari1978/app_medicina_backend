import { IsString } from 'class-validator';

export class LoginEmpresaDto {
  @IsString()
  cuit: string;

  @IsString()
  password: string;
}
