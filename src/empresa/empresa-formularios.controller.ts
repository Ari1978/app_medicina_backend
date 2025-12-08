import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';

import { JwtEmpresaGuard } from '../auth/guards/jwt-empresa.guard';
import { FormulariosService } from '../formularios/formulario.service';

import { CreateVisitaDto } from '../formularios/dto/create-visita.dto';
import { CreateAsesoramientoDto } from '../formularios/dto/create-asesoramiento.dto';
import { CreateAutorizacionDto } from '../formularios/dto/create-autorizacion.dto';
import { CreatePresupuestoDto } from '../formularios/dto/create-presupuesto.dto';
import { CreateTurnoEspecialDto } from '../formularios/dto/create-turno-especial.dto';

@Controller('empresa/formularios')
export class EmpresaFormulariosController {
  constructor(
    private readonly formulariosService: FormulariosService,
  ) {}

  @UseGuards(JwtEmpresaGuard)
  @Post('visita')
  crearVisita(@Req() req: any, @Body() dto: CreateVisitaDto) {
    return this.formulariosService.crear(req.user.id, 'visita', dto);
  }

  @UseGuards(JwtEmpresaGuard)
  @Post('asesoramiento')
  crearAsesoramiento(@Req() req: any, @Body() dto: CreateAsesoramientoDto) {
    return this.formulariosService.crear(req.user.id, 'asesoramiento', dto);
  }

  @UseGuards(JwtEmpresaGuard)
  @Post('autorizacion')
  crearAutorizacion(@Req() req: any, @Body() dto: CreateAutorizacionDto) {
    return this.formulariosService.crear(req.user.id, 'autorizacion', dto);
  }

  @UseGuards(JwtEmpresaGuard)
  @Post('presupuesto')
  crearPresupuesto(@Req() req: any, @Body() dto: CreatePresupuestoDto) {
    return this.formulariosService.crear(req.user.id, 'presupuesto', dto);
  }

  @UseGuards(JwtEmpresaGuard)
  @Post('turno-especial')
  crearTurnoEspecial(@Req() req: any, @Body() dto: CreateTurnoEspecialDto) {
    return this.formulariosService.crear(req.user.id, 'turno-especial', dto);
  }
}

