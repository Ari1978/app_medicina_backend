import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

// Controllers
import { StaffController } from './staff.controller';
import { StaffExamenesController } from './controllers/staff-examenes.controller';
import { StaffPermisosController } from './controllers/staff-permisos.controller';

// Controllers NUEVOS (formularios unificados)
import { FormularioStaffController } from '../formularios/formulario-staff.controller';

// Services
import { StaffService } from './staff.service';
import { StaffExamenesService } from './services/staff-examenes.service';

// Schemas
import { Staff, StaffSchema } from './schemas/staff.schema';

// Guards & Strategies
import { JwtStaffStrategy } from 'src/auth/strategies/jwt-staff.strategy';
import { StaffPermisoGuard } from '../auth/guards/staff-permiso.guard';

// ❗ ACÁ ESTABA EL PROBLEMA: dependencias circulares
import { TurnoModule } from 'src/turno/turno.module';
import { FormularioModule } from '../formularios/formulario.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    forwardRef(() => TurnoModule),       // ✅ antes estaba directo
    forwardRef(() => FormularioModule),  // ✅ también es circular
    forwardRef(() => AuthModule),        // ✅ lo necesitás por guards/strategy

    MongooseModule.forFeature([
      { name: Staff.name, schema: StaffSchema },
    ]),
  ],

  controllers: [
    StaffController,
    StaffExamenesController,
    StaffPermisosController,
    FormularioStaffController,
  ],

  providers: [
    StaffService,
    StaffExamenesService,
    JwtStaffStrategy,
    StaffPermisoGuard,
  ],

  exports: [StaffService],
})
export class StaffModule {}
