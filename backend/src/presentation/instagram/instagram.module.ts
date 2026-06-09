import { Module } from '@nestjs/common';
import { InstagramController } from './instagram.controller';
import { AuthModule } from '../auth/auth.module';
import { InstagramPublishService } from '../../infrastructure/instagram/instagram-publish.service';
import { INSTAGRAM_PUBLISH_SERVICE } from '../../core/ports/services/instagram-publish.service.port';
import { DalleImageGenerationService } from '../../infrastructure/ai/dalle-image-generation.service';
import { AI_IMAGE_GENERATION_SERVICE } from '../../core/ports/services/ai-image-generation.service.port';

@Module({
  imports: [AuthModule],
  controllers: [InstagramController],
  providers: [
    InstagramPublishService,
    { provide: INSTAGRAM_PUBLISH_SERVICE, useClass: InstagramPublishService },
    DalleImageGenerationService,
    { provide: AI_IMAGE_GENERATION_SERVICE, useClass: DalleImageGenerationService },
  ],
  exports: [
    { provide: INSTAGRAM_PUBLISH_SERVICE, useClass: InstagramPublishService },
    { provide: AI_IMAGE_GENERATION_SERVICE, useClass: DalleImageGenerationService },
  ],
})
export class InstagramModule {}
