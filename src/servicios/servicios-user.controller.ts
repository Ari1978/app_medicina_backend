import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ServicioUserService } from './servicio-user.service';
import { CreateServicioUserDto } from './dto/create-servicio-user.dto';
import { UpdateServicioPermisosDto } from './dto/update-servicio-permisos.dto';
import { JwtSuperAdminGuard } from '../auth/guards/jwt-superadmin.guard';

@UseGuards(JwtSuperAdminGuard)
@Controller('servicios/users')
export class ServicioUserController {
  constructor(private readonly service: ServicioUserService) {}

  @Post()
  crear(@Body() dto: CreateServicioUserDto) {
    return this.service.crear(dto);
  }

  @Get()
  listar() {
    return this.service.listar();
  }

  // 👇 NUEVO
  @Patch(':id/permisos')
  actualizarPermisos(
    @Param('id') id: string,
    @Body() dto: UpdateServicioPermisosDto,
  ) {
    return this.service.actualizarPermisos(id, dto.permisos);
  }
}
