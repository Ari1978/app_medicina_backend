import {
  Controller,
  Post,
  Body,
  Res,
  Get,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Response, Request } from 'express';

import { ServiciosAuthService } from './servicios-auth.service';
import {
  setServicioCookie,
  clearServicioCookie,
} from '../../servicios/servicio.jwt';
import { ServiciosJwtGuard } from '../../auth/guards/servicios-jwt.guard';

@Controller('servicios/auth')
export class ServiciosAuthController {
  constructor(private readonly service: ServiciosAuthService) {}

  // =========================
  // LOGIN
  // =========================
  @Post('login')
  async login(
    @Body() body: { username: string; password: string },
    @Res() res: Response,
  ) {
    const { user, token } = await this.service.login(
      body.username,
      body.password,
    );

    setServicioCookie(res, token);

    return res.json({
      id: user.id,
      username: user.username,
      role: user.role, // 👈 'servicios'
    });
  }

  // =========================
  // ME
  // =========================
  @UseGuards(ServiciosJwtGuard)
  @Get('me')
  me(@Req() req: Request) {
    return req.user;
  }

  // =========================
  // LOGOUT
  // =========================
  @Post('logout')
  logout(@Res() res: Response) {
    clearServicioCookie(res);
    return res.json({ message: 'Logout servicio OK' });
  }
}
