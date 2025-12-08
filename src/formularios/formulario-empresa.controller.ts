
import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { JwtEmpresaGuard } from '../auth/guards/jwt-empresa.guard';
import { FormulariosService } from './formulario.service';

import { CreateVisitaDto } from './dto/create-visita.dto';
import { CreateAutorizacionDto } from './dto/create-autorizacion.dto';
import { CreateAsesoramientoDto } from './dto/create-asesoramiento.dto';
import { CreatePresupuestoDto } from './dto/create-presupuesto.dto';
import { CreateTurnoEspecialDto } from './dto/create-turno-especial.dto';

@Controller('empresa/formularios')
export class FormularioEmpresaController {
  constructor(private readonly service: FormulariosService) {}

  @UseGuards(JwtEmpresaGuard)
  @Post('visita')
  crearVisita(@Req() req, @Body() dto: CreateVisitaDto) {
    return this.service.crear(req.user.id, 'visita', dto);
  }

  @UseGuards(JwtEmpresaGuard)
  @Post('asesoramiento')
  crearAsesoramiento(@Req() req, @Body() dto: CreateAsesoramientoDto) {
    return this.service.crear(req.user.id, 'asesoramiento', dto);
  }

  @UseGuards(JwtEmpresaGuard)
  @Post('autorizacion')
  crearAutorizacion(@Req() req, @Body() dto: CreateAutorizacionDto) {
    return this.service.crear(req.user.id, 'autorizacion', dto);
  }

  @UseGuards(JwtEmpresaGuard)
  @Post('presupuesto')
  crearPresupuesto(@Req() req, @Body() dto: CreatePresupuestoDto) {
    return this.service.crear(req.user.id, 'presupuesto', dto);
  }

  @UseGuards(JwtEmpresaGuard)
  @Post('turno-especial')
  crearTurnoEspecial(@Req() req, @Body() dto: CreateTurnoEspecialDto) {
    return this.service.crear(req.user.id, 'turno-especial', dto);
  }
}
