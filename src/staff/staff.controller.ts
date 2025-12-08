import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';

import { Response } from 'express';
import { StaffService } from './staff.service';
import { JwtStaffGuard } from '../auth/guards/staff-jwt.guard';
import { STAFF_COOKIE } from './staff.jwt';
import { setStaffCookie, clearStaffCookie } from './staff.jwt';

@Controller('staff/auth')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  // ============================================================
  // ----------------------- LOGIN STAFF -------------------------
  // ============================================================
  @Post('login')
  async loginStaff(
    @Body() body: { username: string; password: string },
    @Res() res: Response,
  ) {
    const data = await this.staffService.login(body.username, body.password);

    // Cookie HTTPOnly
    setStaffCookie(res, data.token);

    return res.json({
      message: 'Login staff OK',
      staff: data.staff,
    });
  }

  // ============================================================
  // ----------------------- STAFF ME ----------------------------
  // ============================================================
  @UseGuards(JwtStaffGuard)
  @Get('me')
  me(@Req() req: any) {
    return {
      id: req.user.id,
      role: req.user.role,
      username: req.user.username,
      permisos: req.user.permisos,
    };
  }

  // ============================================================
  // ----------------------- LOGOUT ------------------------------
  // ============================================================
  @UseGuards(JwtStaffGuard)
  @Post('logout')
  logout(@Res() res: Response) {
    clearStaffCookie(res);

    return res.json({ message: 'Logout staff OK' });
  }
}


