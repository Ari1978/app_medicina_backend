
import {
  Controller,
  Get,
  Param,
  Patch,
  Body,
  UseGuards,
} from '@nestjs/common';

import { JwtStaffGuard } from '../auth/guards/staff-jwt.guard';
import { FormulariosService } from './formulario.service';

@Controller('staff/formularios')
export class FormularioStaffController {
  constructor(private readonly service: FormulariosService) {}

  // --------------------------------------------
  // 📌 1) Listar formularios pendientes
  // --------------------------------------------
  @UseGuards(JwtStaffGuard)
  @Get('pendientes')
  listarPendientes() {
    return this.service.listarPendientes();
  }

  // --------------------------------------------
  // 📌 2) Obtener un formulario por ID
  // --------------------------------------------
  @UseGuards(JwtStaffGuard)
  @Get(':id')
  obtenerUno(@Param('id') id: string) {
    return this.service.buscarPorId(id);
  }

  // --------------------------------------------
  // 📌 3) Responder un formulario
  // --------------------------------------------
  @UseGuards(JwtStaffGuard)
  @Patch(':id/responder')
  responder(@Param('id') id: string, @Body('respuesta') rsp: string) {
    return this.service.responder(id, rsp);
  }

  // --------------------------------------------
  // 📌 4) Marcar un formulario como RESUELTO
  // --------------------------------------------
  @UseGuards(JwtStaffGuard)
  @Patch(':id/resolver')
  resolver(@Param('id') id: string) {
    return this.service.resolver(id);
  }
}
