
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Sede, SedeSchema } from './schema/sede.schema';
import { SedeService } from './sede.service';

import { SuperadminSedeController } from '../superadmin/superadmin-sede.controller';
import { AdminSedeController } from '../admin/admin-sede.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Sede.name, schema: SedeSchema },
    ]),
  ],
  controllers: [
    SuperadminSedeController,
    AdminSedeController,
  ],
  providers: [SedeService],
  exports: [SedeService],
})
export class SedeModule {}
