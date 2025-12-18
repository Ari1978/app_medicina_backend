import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';

import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiConsumes,
  ApiCookieAuth,
} from '@nestjs/swagger';

import { JwtEmpresaGuard } from '../auth/guards/jwt-empresa.guard';
import { FormulariosService } from '../formularios/formulario.service';

import { CreateVisitaDto } from '../formularios/dto/create-visita.dto';
import { CreateAsesoramientoDto } from '../formularios/dto/create-asesoramiento.dto';
import { CreateAutorizacionDto } from '../formularios/dto/create-autorizacion.dto';
import { CreatePresupuestoDto } from '../formularios/dto/create-presupuesto.dto';
import { CreateTurnoEspecialDto } from '../formularios/dto/create-turno-especial.dto';

import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@ApiTags('Empresa - Formularios')
@ApiCookieAuth('asmel_empresa_token')
@Controller('empresa/formularios')
export class EmpresaFormulariosController {
  constructor(
    private readonly formulariosService: FormulariosService,
  ) {}

  // ============================================================
  // ✔ VISITA
  // ============================================================
  @ApiOperation({ summary: 'Crear formulario de visita' })
  @UseGuards(JwtEmpresaGuard)
  @Post('visita')
  crearVisita(@Req() req: any, @Body() dto: CreateVisitaDto) {
    return this.formulariosService.crear(req.user.id, 'visita', dto);
  }

  // ============================================================
  // ✔ ASESORAMIENTO (CON ARCHIVO)
  // ============================================================
  @ApiOperation({ summary: 'Crear formulario de asesoramiento (con archivo)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        archivo: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseGuards(JwtEmpresaGuard)
  @Post('asesoramiento')
  @UseInterceptors(
    FileInterceptor('archivo', {
      storage: diskStorage({
        destination: './uploads/asesoramientos',
        filename: (req, file, callback) => {
          const uniqueName =
            Date.now() + '-' + file.originalname.replace(/\s/g, '_');
          callback(null, uniqueName);
        },
      }),
      fileFilter: (req, file, cb) => {
        const tiposPermitidos = [
          'image/jpeg',
          'image/png',
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];

        if (!tiposPermitidos.includes(file.mimetype)) {
          cb(new BadRequestException('Tipo de archivo no permitido'), false);
        } else {
          cb(null, true);
        }
      },
    }),
  )
  crearAsesoramiento(
    @Req() req: any,
    @UploadedFile() archivo: Express.Multer.File,
    @Body() dto: CreateAsesoramientoDto,
  ) {
    return this.formulariosService.crear(
      req.user.id,
      'asesoramiento',
      dto,
      archivo,
    );
  }

  // ============================================================
  // ✔ AUTORIZACIÓN
  // ============================================================
  @ApiOperation({ summary: 'Crear formulario de autorización' })
  @UseGuards(JwtEmpresaGuard)
  @Post('autorizacion')
  crearAutorizacion(@Req() req: any, @Body() dto: CreateAutorizacionDto) {
    return this.formulariosService.crear(req.user.id, 'autorizacion', dto);
  }

  // ============================================================
  // ✔ PRESUPUESTO
  // ============================================================
  @ApiOperation({ summary: 'Crear formulario de presupuesto' })
  @UseGuards(JwtEmpresaGuard)
  @Post('presupuesto')
  crearPresupuesto(@Req() req: any, @Body() dto: CreatePresupuestoDto) {
    return this.formulariosService.crear(req.user.id, 'presupuesto', dto);
  }

  // ============================================================
  // ✔ TURNO ESPECIAL (CON ARCHIVO)
  // ============================================================
  @ApiOperation({ summary: 'Crear formulario de turno especial (con archivo)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        archivo: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseGuards(JwtEmpresaGuard)
  @Post('turno-especial')
  @UseInterceptors(
    FileInterceptor('archivo', {
      storage: diskStorage({
        destination: './uploads/turnos-especiales',
        filename: (req, file, callback) => {
          const uniqueName =
            Date.now() + '-' + file.originalname.replace(/\s/g, '_');
          callback(null, uniqueName);
        },
      }),
      fileFilter: (req, file, cb) => {
        const tiposPermitidos = [
          'image/jpeg',
          'image/png',
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];

        if (!tiposPermitidos.includes(file.mimetype)) {
          cb(new BadRequestException('Tipo de archivo no permitido'), false);
        } else {
          cb(null, true);
        }
      },
    }),
  )
  crearTurnoEspecial(
    @Req() req: any,
    @UploadedFile() archivo: Express.Multer.File,
    @Body() dto: CreateTurnoEspecialDto,
  ) {
    return this.formulariosService.crear(
      req.user.id,
      'turno-especial',
      dto,
      archivo,
    );
  }
}

