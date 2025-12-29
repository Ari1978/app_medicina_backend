import {
  BadRequestException,
  Controller,
  Post,
  Get,
  Query,
  Param,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Body,
  Req,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Response, Request } from 'express';

import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';

import { ServiciosJwtGuard } from '../auth/guards/servicios-jwt.guard';
import { FileProcessorService } from '../file-processor/file-processor.service';
import { ServicioArchivoService } from './servicios.service';

@Controller('servicios/archivos')
@UseGuards(ServiciosJwtGuard)
export class ServiciosController {
  constructor(
    private readonly fileProcessor: FileProcessorService,
    private readonly archivoService: ServicioArchivoService,
  ) {}

  // ============================================================
  // MULTER CONFIG
  // ============================================================
  private static multerOptions = {
    storage: diskStorage({
      destination: (_req, _file, cb) => {
        cb(null, path.join(process.cwd(), 'uploads', 'servicios'));
      },
      filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname || '');
        const name = `${Date.now()}-${Math.random()
          .toString(16)
          .slice(2)}${ext || '.bin'}`;
        cb(null, name);
      },
    }),
    limits: {
      fileSize: 25 * 1024 * 1024,
    },
  };

  // ============================================================
  // UPLOAD POR ÁREA
  // POST /api/servicios/archivos/upload
  // ============================================================
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', ServiciosController.multerOptions),
  )
  async upload(
    @Req() req: Request,
    @UploadedFile() file: Express.Multer.File,
    @Body()
    body: {
      servicioId: string;
      area: string;
    },
  ) {
    if (!file) {
      throw new BadRequestException('Archivo requerido');
    }

    const user: any = req.user;

    // 🔒 VALIDAR ÁREA
    if (!user.areas?.includes(body.area)) {
      throw new ForbiddenException(
        'No tenés permiso para esta área',
      );
    }

    const result = await this.fileProcessor.procesarArchivo({
      pathOriginal: file.path,
      mimeType: file.mimetype,
      filename: file.originalname,
    });

    return this.archivoService.crear({
      servicioId: body.servicioId,
      area: body.area,
      original: result.original,
      preview: result.preview ?? undefined,
      filename: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      categoria: this.detectarCategoria(file.mimetype),
    });
  }

  // ============================================================
  // GET /api/servicios/archivos?servicioId=...
  // ============================================================
  @Get()
  async listar(
    @Req() req: Request,
    @Query('servicioId') servicioId?: string,
  ) {
    if (!servicioId) {
      throw new BadRequestException('servicioId requerido');
    }

    const user: any = req.user;

    return this.archivoService.listarPorServicioYAreas(
      servicioId,
      user.areas || [],
    );
  }

  // ============================================================
  // CATEGORÍA SIMPLE
  // ============================================================
  private detectarCategoria(mime: string): string {
    if (mime.includes('pdf')) return 'pdf';
    if (mime.startsWith('image/')) return 'image';
    if (mime.includes('dicom')) return 'dicom';
    return 'other';
  }

  // =====================================================
  // DESCARGA SEGURA
  // GET /api/servicios/archivos/:id/download
  // =====================================================
  @Get(':id/download')
async download(
  @Req() req: Request,
  @Param('id') id: string,
  @Res() res: Response,
) {
  const user: any = req.user;

  const archivo = await this.archivoService.obtenerPorId(id);
  if (!archivo) {
    throw new NotFoundException('Archivo no encontrado');
  }

  // 🔒 VALIDAR ÁREA
  if (!user.areas?.includes(archivo.area)) {
    throw new ForbiddenException(
      'No tenés permiso para descargar este archivo',
    );
  }

  if (!fs.existsSync(archivo.original)) {
    throw new NotFoundException('Archivo físico no encontrado');
  }

  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${archivo.filename}"`,
  );
  res.setHeader('Content-Type', archivo.mimeType);

  return res.sendFile(archivo.original, { root: '/' });
}

// =====================================================
// PREVIEW INLINE SEGURO
// GET /api/servicios/archivos/:id/preview
// =====================================================
@Get(':id/preview')
async preview(
  @Req() req: Request,
  @Param('id') id: string,
  @Res() res: Response,
) {
  const user: any = req.user;

  const archivo = await this.archivoService.obtenerPorId(id);
  if (!archivo) {
    throw new NotFoundException('Archivo no encontrado');
  }

  // 🔒 VALIDAR ÁREA
  if (!user.areas?.includes(archivo.area)) {
    throw new ForbiddenException(
      'No tenés permiso para ver este archivo',
    );
  }

  const filePath = archivo.preview || archivo.original;

  if (!fs.existsSync(filePath)) {
    throw new NotFoundException('Archivo físico no encontrado');
  }

  // 👇 INLINE (no descarga)
  res.setHeader(
    'Content-Disposition',
    `inline; filename="${archivo.filename}"`,
  );
  res.setHeader('Content-Type', archivo.mimeType);

  return res.sendFile(filePath, { root: '/' });
}

}
