export enum FileCategory {
  PDF = 'pdf',
  IMAGE = 'image',
  OFFICE = 'office',
  DICOM = 'dicom',
  OTHER = 'other',
}

export function detectarCategoria(mime: string): FileCategory {
  if (mime === 'application/pdf') return FileCategory.PDF;

  if (mime.startsWith('image/')) return FileCategory.IMAGE;

  if (
    mime.includes('word') ||
    mime.includes('excel') ||
    mime.includes('powerpoint')
  ) {
    return FileCategory.OFFICE;
  }

  if (mime === 'application/dicom') return FileCategory.DICOM;

  return FileCategory.OTHER;
}
