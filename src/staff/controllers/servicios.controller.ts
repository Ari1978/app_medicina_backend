// src/staff/servicios/servicios.controller.ts
import {
  Controller,
  Post,
  Param,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { JwtStaffGuard } from '../../auth/guards/staff-jwt.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { StaffPermisoGuard } from '../../auth/guards/staff-permiso.guard';
import { TurnoService } from '../../turno/turno.service';

import { Roles } from '../../auth/decorators/roles.decorator';
import { StaffPermiso } from '../../auth/decorators/staff-permiso.decorator';

import { Role } from '../../auth/roles.enum';
import { StaffPermisoEnum } from '../../auth/enums/staff-permiso.enum';

import { FileProcessorService } from '../../file-processor/file-processor.service';

@Controller('staff/servicios')
@UseGuards(JwtStaffGuard, RolesGuard, StaffPermisoGuard)
@Roles(Role.Staff)
export class ServiciosController {
  constructor(
    private readonly fileProcessor: FileProcessorService,
    private readonly turnoService: TurnoService,
  ) {}

  // ============================================================
  // RAYOS
  // ============================================================
  @Post('rayos/turnos/:turnoId')
  @StaffPermiso(StaffPermisoEnum.RAYOS)
  @UseInterceptors(FileInterceptor('file'))
  async subirRayos(
    @Param('turnoId') turnoId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Archivo requerido');
    }

    // ✅ USAR turnoId (fix del warning)
    const turno = await this.turnoService.buscarPorId(turnoId);
    if (!turno) {
      throw new NotFoundException('Turno no encontrado');
    }

    return this.fileProcessor.procesarArchivo({
      pathOriginal: file.path,
      mimeType: file.mimetype,
      filename: file.originalname,
    });
  }

  // ============================================================
  // LABORATORIO
  // ============================================================
  @Post('laboratorio/turnos/:turnoId')
  @StaffPermiso(StaffPermisoEnum.LABORATORIO)
  @UseInterceptors(FileInterceptor('file'))
  async subirLaboratorio(
    @Param('turnoId') turnoId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Archivo requerido');
    }

    // ✅ USAR turnoId (fix del warning)
    const turno = await this.turnoService.buscarPorId(turnoId);
    if (!turno) {
      throw new NotFoundException('Turno no encontrado');
    }

    return this.fileProcessor.procesarArchivo({
      pathOriginal: file.path,
      mimeType: file.mimetype,
      filename: file.originalname,
    });
  }

  // ============================================================
  // FONOAUDIOLOGÍA
  // ============================================================
  @Post('fonoaudiologia/turnos/:turnoId')
  @StaffPermiso(StaffPermisoEnum.FONOAUDIOLOGIA)
  @UseInterceptors(FileInterceptor('file'))
  async subirFono(
    @Param('turnoId') turnoId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Archivo requerido');
    }

    // ✅ USAR turnoId (fix del warning)
    const turno = await this.turnoService.buscarPorId(turnoId);
    if (!turno) {
      throw new NotFoundException('Turno no encontrado');
    }

    return this.fileProcessor.procesarArchivo({
      pathOriginal: file.path,
      mimeType: file.mimetype,
      filename: file.originalname,
    });
  }

  // ============================================================
  // ELECTROENCEFALOGRAMA
  // ============================================================
  @Post('electroencefalograma/turnos/:turnoId')
  @StaffPermiso(StaffPermisoEnum.ELECTROENCEFALOGRAMA)
  @UseInterceptors(FileInterceptor('file'))
  async subirElectroencefalograma(
    @Param('turnoId') turnoId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Archivo requerido');
    }

    // ✅ USAR turnoId (fix del warning)
    const turno = await this.turnoService.buscarPorId(turnoId);
    if (!turno) {
      throw new NotFoundException('Turno no encontrado');
    }

    return this.fileProcessor.procesarArchivo({
      pathOriginal: file.path,
      mimeType: file.mimetype,
      filename: file.originalname,
    });
  }

  // ============================================================
  // PSICOLOGÍA
  // ============================================================
  @Post('psicologia/turnos/:turnoId')
  @StaffPermiso(StaffPermisoEnum.PSICOLOGIA)
  @UseInterceptors(FileInterceptor('file'))
  async subirPsicologia(
    @Param('turnoId') turnoId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Archivo requerido');
    }

    // ✅ USAR turnoId (fix del warning)
    const turno = await this.turnoService.buscarPorId(turnoId);
    if (!turno) {
      throw new NotFoundException('Turno no encontrado');
    }

    return this.fileProcessor.procesarArchivo({
      pathOriginal: file.path,
      mimeType: file.mimetype,
      filename: file.originalname,
    });
  }

  // ============================================================
  // ESPIROMETRÍA
  // ============================================================
  @Post('espirometria/turnos/:turnoId')
  @StaffPermiso(StaffPermisoEnum.ESPIROMETRIA)
  @UseInterceptors(FileInterceptor('file'))
  async subirEspirometria(
    @Param('turnoId') turnoId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Archivo requerido');
    }

    // ✅ USAR turnoId (fix del warning)
    const turno = await this.turnoService.buscarPorId(turnoId);
    if (!turno) {
      throw new NotFoundException('Turno no encontrado');
    }

    return this.fileProcessor.procesarArchivo({
      pathOriginal: file.path,
      mimeType: file.mimetype,
      filename: file.originalname,
    });
  }

  // ============================================================
  // ELECTROCARDIOGRAMA
  // ============================================================
  @Post('electrocardiograma/turnos/:turnoId')
  @StaffPermiso(StaffPermisoEnum.ELECTROCARDIOGRAMA)
  @UseInterceptors(FileInterceptor('file'))
  async subirElectrocardiograma(
    @Param('turnoId') turnoId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Archivo requerido');
    }

    // ✅ USAR turnoId (fix del warning)
    const turno = await this.turnoService.buscarPorId(turnoId);
    if (!turno) {
      throw new NotFoundException('Turno no encontrado');
    }

    return this.fileProcessor.procesarArchivo({
      pathOriginal: file.path,
      mimeType: file.mimetype,
      filename: file.originalname,
    });
  }
}
