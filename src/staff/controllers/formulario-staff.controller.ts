
import {
  Controller,
  Get,
  Param,
  Patch,
  Body,
  UseGuards,
} from '@nestjs/common';

import { JwtStaffGuard } from '../../auth/guards/staff-jwt.guard';
import { FormulariosService } from '../../formularios/formulario.service';

@Controller('staff/formularios')
export class FormularioStaffController {
  constructor(private readonly service: FormulariosService) {}

  // ----------------------------------------------------
  // 📌 1) Listar todos los formularios pendientes
  // ----------------------------------------------------
  @UseGuards(JwtStaffGuard)
  @Get('pendientes')
  listarPendientes() {
    return this.service.listarPendientes();
  }

  // ----------------------------------------------------
  // 📌 2) Obtener información completa de un formulario
  // ----------------------------------------------------
  @UseGuards(JwtStaffGuard)
  @Get(':id')
  obtenerUno(@Param('id') id: string) {
    return this.service.buscarPorId(id);
  }

  // ----------------------------------------------------
  // 📌 3) Responder un formulario y pasarlo a "en_progreso"
  // ----------------------------------------------------
  @UseGuards(JwtStaffGuard)
  @Patch(':id/responder')
  responder(
    @Param('id') id: string,
    @Body('respuesta') respuesta: string,
  ) {
    return this.service.responder(id, respuesta);
  }

  // ----------------------------------------------------
  // 📌 4) Marcar un formulario como "resuelto"
  // ----------------------------------------------------
  @UseGuards(JwtStaffGuard)
  @Patch(':id/resolver')
  resolver(@Param('id') id: string) {
    return this.service.resolver(id);
  }
}
