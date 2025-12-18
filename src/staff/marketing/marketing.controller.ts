import { Controller, Get, Patch, Param } from '@nestjs/common';
import { FormulariosService } from '../../formularios/formulario.service';

@Controller('marketing')
export class MarketingController {
  constructor(
    private readonly formulariosService: FormulariosService,
  ) {}

  @Get('presupuestos')
  obtenerPresupuestos() {
    return this.formulariosService.listarPorTipo('presupuesto');
  }

  @Patch('presupuestos/:id/presupuestado')
  marcarComoPresupuestado(@Param('id') id: string) {
    return this.formulariosService.marcarPresupuestado(id);
  }
}
