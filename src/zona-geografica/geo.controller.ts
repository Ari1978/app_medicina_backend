// src/geo/geo.controller.ts
import {
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { GeoService } from './geo.service';
import { JwtSuperAdminGuard } from '../auth/guards/jwt-superadmin.guard';

@ApiTags('Geo')
@Controller('geo')
export class GeoController {
  constructor(private readonly geoService: GeoService) {}

  // 🔄 Ejecutar una sola vez (SOLO SUPERADMIN)
  @UseGuards(JwtSuperAdminGuard)
  @Post('sync')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Sincronizar datos geográficos',
    description:
      'Sincroniza provincias, partidos y localidades. Endpoint exclusivo para SuperAdmin.',
  })
  @ApiResponse({
    status: 200,
    description: 'Sincronización completada correctamente',
  })
  sync() {
    return this.geoService.syncTodo();
  }

  // ✅ FRONT: Provincias
  @Get('provincias')
  @ApiOperation({
    summary: 'Listar provincias',
    description: 'Obtiene el listado de provincias disponibles',
  })
  @ApiResponse({
    status: 200,
    description: 'Listado de provincias',
  })
  provincias() {
    return this.geoService.getProvincias();
  }

  // ✅ FRONT: Partidos por provincia
  @Get('partidos')
  @ApiOperation({
    summary: 'Listar partidos por provincia',
    description: 'Obtiene los partidos de una provincia',
  })
  @ApiQuery({
    name: 'provincia',
    required: true,
    description: 'Nombre de la provincia',
    example: 'Buenos Aires',
  })
  @ApiResponse({
    status: 200,
    description: 'Listado de partidos',
  })
  partidos(@Query('provincia') provincia: string) {
    return this.geoService.getPartidos(provincia);
  }

  // ✅ FRONT: Localidades por provincia + partido
  @Get('localidades')
  @ApiOperation({
    summary: 'Listar localidades',
    description: 'Obtiene las localidades por provincia y partido',
  })
  @ApiQuery({
    name: 'provincia',
    required: true,
    description: 'Nombre de la provincia',
    example: 'Buenos Aires',
  })
  @ApiQuery({
    name: 'partido',
    required: true,
    description: 'Nombre del partido',
    example: 'Avellaneda',
  })
  @ApiResponse({
    status: 200,
    description: 'Listado de localidades',
  })
  localidades(
    @Query('provincia') provincia: string,
    @Query('partido') partido: string,
  ) {
    return this.geoService.getLocalidades(provincia, partido);
  }
}
