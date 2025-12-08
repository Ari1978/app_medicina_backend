import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { StaffUserController } from './staff.user.controller';
import { StaffUserService } from './staff-user.service';

import { StaffUser, StaffUserSchema } from './staff-user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: StaffUser.name, schema: StaffUserSchema },
    ]),
  ],
  controllers: [StaffUserController],
  providers: [StaffUserService],
  exports: [StaffUserService],
})
export class StaffUserModule {}
