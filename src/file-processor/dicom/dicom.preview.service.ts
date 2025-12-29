import * as dcmjs from 'dcmjs';
import sharp from 'sharp';
import * as fs from 'fs';

export class DicomPreviewService {
  async generarPreview(dicomPath: string, outputPng: string) {
    const buffer = fs.readFileSync(dicomPath);
    const dicomData = dcmjs.data.DicomMessage.readFile(buffer);
    const dataset = dcmjs.data.DicomMetaDictionary.naturalizeDataset(
      dicomData.dict,
    );

    const pixelData = dataset.PixelData;
    if (!pixelData) throw new Error('DICOM sin imagen');

    await sharp(Buffer.from(pixelData))
      .resize({ width: 1024 })
      .grayscale()
      .png()
      .toFile(outputPng);

    return outputPng;
  }
}
