import { Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { GeoService } from './geo.service';
import { JwtSuperAdminGuard } from '../auth/guards/jwt-superadmin.guard';

@Controller('geo')
export class GeoController {
  constructor(private readonly geoService: GeoService) {}

  // 🔄 Ejecutar una sola vez (SOLO SUPERADMIN)
  @UseGuards(JwtSuperAdminGuard)
  @Post('sync')
  sync() {
    return this.geoService.syncTodo();
  }

  // ✅ FRONT: Provincias
  @Get('provincias')
  provincias() {
    return this.geoService.getProvincias();
  }

  // ✅ FRONT: Partidos por provincia
  @Get('partidos')
  partidos(@Query('provincia') provincia: string) {
    return this.geoService.getPartidos(provincia);
  }

  // ✅ FRONT: Localidades por provincia+partido
  @Get('localidades')
  localidades(
    @Query('provincia') provincia: string,
    @Query('partido') partido: string,
  ) {
    return this.geoService.getLocalidades(provincia, partido);
  }
}
