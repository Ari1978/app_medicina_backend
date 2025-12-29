import { IsArray, IsString } from 'class-validator';

export class UpdateServicioPermisosDto {
  @IsArray()
  @IsString({ each: true })
  permisos: string[];
}
