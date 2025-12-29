import { Module, forwardRef } from '@nestjs/common';

import { AvailabilityService } from './availability.service';
import { AvailabilityController } from './availability.controller';

import { BlocksService } from './blocks.service';
import { FeriadosService } from './feriados.service';
import { AvailabilityCacheService } from './availability.cache.service';

import { TurnoModule } from '../turno/turno.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    forwardRef(() => TurnoModule),
    forwardRef(() => AuthModule),
  ],

  controllers: [AvailabilityController],

  providers: [
    AvailabilityService,
    BlocksService,
    FeriadosService,
    AvailabilityCacheService,
  ],

  exports: [
    AvailabilityService,
  ],
})
export class AvailabilityModule {}
