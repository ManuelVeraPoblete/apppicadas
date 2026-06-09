import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { IStorageService, UploadResult } from '../../../core/ports/services/storage.service.port';

@Injectable()
export class LocalStorageService implements IStorageService {
  private readonly logger = new Logger(LocalStorageService.name);
  private readonly uploadsDir: string;
  private readonly baseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
    const explicitUrl = configService.get<string>('UPLOADS_BASE_URL');
    if (explicitUrl) {
      this.baseUrl = explicitUrl;
    } else {
      const port = configService.get<number>('PORT', 3000);
      const host = configService.get<string>('HOST');
      if (!host) {
        this.logger.warn('HOST is not configured — upload URLs will use localhost; set HOST to your LAN IP for real-device testing');
      }
      this.baseUrl = `http://${host ?? 'localhost'}:${port}/uploads`;
    }
  }

  private safeFilename(raw: string): string {
    return raw.replace(/[^a-zA-Z0-9._-]/g, '_');
  }

  private resolveUploadsPath(filename: string): string {
    const resolved = path.resolve(this.uploadsDir, filename);
    if (!resolved.startsWith(this.uploadsDir + path.sep) && resolved !== this.uploadsDir) {
      throw new Error('Ruta de archivo inválida');
    }
    return resolved;
  }

  async upload(
    file: Express.Multer.File,
    _folder: string,
    publicId?: string,
  ): Promise<UploadResult> {
    const ext = (file.originalname.split('.').pop() ?? 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
    const baseName = publicId ? this.safeFilename(publicId) : String(Date.now());
    const filename = `${baseName}.${ext}`;
    const filePath = this.resolveUploadsPath(filename);
    fs.writeFileSync(filePath, file.buffer);
    const url = `${this.baseUrl}/${filename}`;
    return { url, publicId: filename };
  }

  async uploadBuffer(
    buffer: Buffer,
    _folder: string,
    publicId?: string,
  ): Promise<UploadResult> {
    const baseName = publicId ? this.safeFilename(publicId) : String(Date.now());
    const filename = `${baseName}.jpg`;
    const filePath = this.resolveUploadsPath(filename);
    fs.writeFileSync(filePath, buffer);
    const url = `${this.baseUrl}/${filename}`;
    return { url, publicId: filename };
  }

  async delete(publicId: string): Promise<void> {
    const filePath = this.resolveUploadsPath(this.safeFilename(publicId));
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
}
