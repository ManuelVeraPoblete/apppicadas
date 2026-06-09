import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import {
  IStorageService,
  UploadResult,
} from '../../../core/ports/services/storage.service.port';

@Injectable()
export class CloudinaryService implements IStorageService {
  constructor(private readonly configService: ConfigService) {
    cloudinary.config({
      cloud_name: configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  upload(
    file: Express.Multer.File,
    folder: string,
    publicId?: string,
  ): Promise<UploadResult> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { folder, public_id: publicId, overwrite: true, resource_type: 'image' },
          (error, result) => {
            if (error)
              return reject(new Error(error.message ?? JSON.stringify(error)));
            if (!result)
              return reject(new Error('Cloudinary no devolvió resultado'));
            resolve({ url: result.secure_url, publicId: result.public_id });
          },
        )
        .end(file.buffer);
    });
  }

  uploadBuffer(
    buffer: Buffer,
    folder: string,
    publicId?: string,
  ): Promise<UploadResult> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { folder, public_id: publicId, overwrite: true, resource_type: 'image' },
          (error, result) => {
            if (error)
              return reject(new Error(error.message ?? JSON.stringify(error)));
            if (!result)
              return reject(new Error('Cloudinary no devolvió resultado'));
            resolve({ url: result.secure_url, publicId: result.public_id });
          },
        )
        .end(buffer);
    });
  }

  async delete(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId);
  }
}
