
import { Controller, Get, UseGuards } from '@nestjs/common';
import { EmpresaService } from './empresa.service';
import { JwtStaffGuard } from '../auth/guards/staff-jwt.guard';

@Controller('empresa')
export class EmpresaPublicController {
  constructor(private readonly empresaService: EmpresaService) {}

  // ✅ Esto es lo que usa el selector del front
  @UseGuards(JwtStaffGuard)
  @Get()
  async listarEmpresas() {
    return this.empresaService.findAll();
  }
}
