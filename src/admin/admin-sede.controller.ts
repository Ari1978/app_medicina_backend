import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';

import { SedeService } from '../sedes/sede.service';
import { CreateSedeDto } from '../sedes/dto/create-sede.dto';
import { UpdateSedeDto } from '../sedes/dto/update-sede.dto';

// Si tenés guard de admin, lo agregamos después
// import { JwtAdminGuard } from '../guards/jwt-admin.guard';

@Controller('admin/sedes')
export class AdminSedeController {
  constructor(private readonly service: SedeService) {}

  @Post()
  crear(@Body() dto: CreateSedeDto) {
    return this.service.crear(dto);
  }

  @Get()
  listar() {
    return this.service.listar();
  }

  @Patch(':id')
  editar(@Param('id') id: string, @Body() dto: UpdateSedeDto) {
    return this.service.editar(id, dto);
  }

  @Delete(':id')
  eliminar(@Param('id') id: string) {
    return this.service.eliminar(id);
  }
}
