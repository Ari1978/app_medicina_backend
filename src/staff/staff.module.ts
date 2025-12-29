import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

// Controllers
import { StaffController } from './staff.controller';
import { StaffExamenesController } from './controllers/staff-examenes.controller';
import { StaffPermisosController } from './controllers/staff-permisos.controller';
import { StaffTurnosController } from './controllers/staff-turnos.controller';

// Formularios
import { FormularioStaffController } from '../formularios/formulario-staff.controller';

// Services
import { StaffService } from './staff.service';
import { StaffExamenesService } from './services/staff-examenes.service';

// Schemas
import { Staff, StaffSchema } from './schemas/staff.schema';
import { Turno, TurnoSchema } from '../turno/schema/turno.schema';

// Guards & Strategies
import { JwtStaffStrategy } from 'src/auth/strategies/jwt-staff.strategy';
import { StaffPermisoGuard } from '../auth/guards/staff-permiso.guard';

// Modules
import { TurnoModule } from 'src/turno/turno.module';
import { FormularioModule } from '../formularios/formulario.module';
import { AuthModule } from '../auth/auth.module';
import { RecepcionModule } from './recepcion/recepcion.module';


@Module({
  imports: [
    forwardRef(() => TurnoModule),
    forwardRef(() => FormularioModule),
    forwardRef(() => AuthModule),
    forwardRef(() => RecepcionModule),

    // 👇 ACÁ ESTABA EL BLOQUEANTE
    MongooseModule.forFeature([
      { name: Staff.name, schema: StaffSchema },
      { name: Turno.name, schema: TurnoSchema },
    ]),
  ],

  controllers: [
    StaffController,
    StaffExamenesController,
    StaffPermisosController,
    StaffTurnosController,
  
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
