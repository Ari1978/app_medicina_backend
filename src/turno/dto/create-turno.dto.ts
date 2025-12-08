import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsArray,
  ValidateIf,
} from 'class-validator';

export class CreateTurnoDto {
  // ============================
  // TIPO
  // ============================
  @IsEnum(['examen', 'estudios'])
  tipo: string;

  // ============================
  // EMPLEADO
  // ============================
  @IsString()
  @IsNotEmpty()
  empleadoNombre: string;

  @IsString()
  @IsNotEmpty()
  empleadoApellido: string;

  @IsString()
  @IsNotEmpty()
  empleadoDni: string;

  @IsString()
  @IsNotEmpty()
  puesto: string;

  // ============================
  // MOTIVO EXAMEN ✅
  // ============================
  @ValidateIf(o => o.tipo === 'examen')
  @IsString()
  @IsNotEmpty()
  @IsEnum(['ingreso', 'egreso', 'periodico'])
  motivo?: string;

  // ============================
  // MOTIVO ESTUDIO ✅ NUEVO
  // ============================
  @ValidateIf(o => o.tipo === 'estudios')
  @IsString()
  @IsNotEmpty()
  @IsEnum(['complementario', 'pendiente', 'otro'])
  motivoEstudio?: string;

  // ============================
  // PERFIL EXAMEN
  // ============================
  @ValidateIf(o => o.tipo === 'examen')
  @IsOptional()
  @IsString()
  perfilExamen?: string;

  @ValidateIf(o => o.tipo === 'examen')
  @IsOptional()
  @IsArray()
  estudiosAdicionales?: string[];

  // ============================
  // LISTA ESTUDIOS ✅ OBLIGATORIA SI ES ESTUDIO
  // ============================
  @ValidateIf(o => o.tipo === 'estudios')
  @IsArray()
  @IsNotEmpty()
  listaEstudios?: string[];

  // ============================
  // FECHA / HORA
  // ============================
  @IsString()
  @IsNotEmpty()
  fecha: string;

  @IsString()
  @IsNotEmpty()
  hora: string;

  // ============================
  // SOLICITANTE
  // ============================
  @IsString()
  @IsNotEmpty()
  solicitanteNombre: string;

  @IsString()
  @IsNotEmpty()
  solicitanteApellido: string;

  @IsString()
  @IsNotEmpty()
  solicitanteCelular: string;
}
