import { BadRequestException } from '@nestjs/common';

export function validarDicom(path: string) {
  if (!path.endsWith('.dcm')) {
    throw new BadRequestException('Archivo no es DICOM');
  }
}
