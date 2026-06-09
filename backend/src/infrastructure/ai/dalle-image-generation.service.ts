import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { v2 as cloudinary } from 'cloudinary';
import { IAiImageGenerationService } from '../../core/ports/services/ai-image-generation.service.port';

@Injectable()
export class DalleImageGenerationService implements IAiImageGenerationService {
  private readonly logger = new Logger(DalleImageGenerationService.name);
  private readonly client: OpenAI;

  constructor(private readonly config: ConfigService) {
    this.client = new OpenAI({ apiKey: config.getOrThrow<string>('OPENAI_API_KEY') });
    cloudinary.config({
      cloud_name: config.getOrThrow<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: config.getOrThrow<string>('CLOUDINARY_API_KEY'),
      api_secret: config.getOrThrow<string>('CLOUDINARY_API_SECRET'),
    });
  }

  async generateAndUpload(prompt: string, publicId: string): Promise<string> {
    this.logger.debug(`Generating image for: ${prompt.slice(0, 80)}…`);

    const response = await this.client.images.generate({
      model: 'gpt-image-1',
      prompt,
      n: 1,
      size: '1024x1024',
    });

    const b64 = response.data?.[0]?.b64_json;
    if (!b64) throw new Error('gpt-image-1 no devolvió imagen');
    const buffer = Buffer.from(b64, 'base64');

    const uploadResult = await new Promise<{ secure_url: string }>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { folder: 'offer-images', public_id: publicId, overwrite: true, resource_type: 'image' },
          (error, result) => {
            if (error) return reject(new Error(error.message ?? JSON.stringify(error)));
            if (!result) return reject(new Error('Cloudinary no devolvió resultado'));
            resolve(result);
          },
        )
        .end(buffer);
    });

    this.logger.log(`Image uploaded to Cloudinary: ${uploadResult.secure_url}`);
    return uploadResult.secure_url;
  }
}
