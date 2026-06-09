import { Inject, Injectable, Logger } from '@nestjs/common';

import {
  IInstagramPublishService,
  INSTAGRAM_PUBLISH_SERVICE,
} from '../../../core/ports/services/instagram-publish.service.port';
import {
  IAiImageGenerationService,
  AI_IMAGE_GENERATION_SERVICE,
} from '../../../core/ports/services/ai-image-generation.service.port';
import {
  IOfferRepository,
  OFFER_REPOSITORY,
} from '../../../core/ports/repositories/offer.repository.port';
import {
  IPlaceRepository,
  PLACE_REPOSITORY,
} from '../../../core/ports/repositories/place.repository.port';
import { OfferEntity } from '../../../core/domain/entities/offer.entity';
import { DiscountType } from '../../../core/domain/enums/discount-type.enum';

@Injectable()
export class PublishOfferToInstagramUseCase {
  private readonly logger = new Logger(PublishOfferToInstagramUseCase.name);

  constructor(
    @Inject(INSTAGRAM_PUBLISH_SERVICE)
    private readonly instagram: IInstagramPublishService,
    @Inject(AI_IMAGE_GENERATION_SERVICE)
    private readonly aiImage: IAiImageGenerationService,
    @Inject(OFFER_REPOSITORY)
    private readonly offerRepository: IOfferRepository,
    @Inject(PLACE_REPOSITORY)
    private readonly placeRepository: IPlaceRepository,
  ) {}

  async execute(offerId: string): Promise<void> {
    const offer = await this.offerRepository.findById(offerId);
    if (!offer) {
      this.logger.warn(`Offer ${offerId} not found — skipping Instagram publish`);
      return;
    }

    const place = await this.placeRepository.findById(offer.placeId);
    const placeName = place?.name ?? '';

    let imageUrl = offer.imageUrl;

    if (!imageUrl) {
      try {
        const prompt = this.buildImagePrompt(offer, placeName);
        imageUrl = await this.aiImage.generateAndUpload(prompt, `offer-${offerId}`);
        await this.offerRepository.update(offerId, { imageUrl });
        this.logger.log(`Image generated for offer ${offerId}: ${imageUrl}`);
      } catch (err) {
        this.logger.error(`Failed to generate image for offer ${offerId}`, err);
        return;
      }
    }

    const caption = this.buildCaption(offer, placeName);

    try {
      const postId = await this.instagram.publish({ imageUrl, caption });
      await this.offerRepository.update(offerId, { instagramPostId: postId });
      this.logger.log(`Offer ${offerId} published to Instagram → ${postId}`);
    } catch (err) {
      this.logger.error(`Failed to publish offer ${offerId} to Instagram`, err);
    }
  }

  private buildImagePrompt(offer: OfferEntity, placeName: string): string {
    const discount = this.formatDiscount(offer);
    const parts = [
      `Create a vibrant, appetizing promotional banner for a food offer.`,
      `Title: "${offer.title}".`,
      offer.description ? `Description: "${offer.description}".` : '',
      discount ? `Promotion: ${discount}.` : '',
      placeName ? `Restaurant name: "${placeName}".` : '',
      `Style: bold colors, modern design, professional food photography aesthetic, Instagram-ready square format.`,
      `No text overlays — clean background with food imagery.`,
    ];
    return parts.filter(Boolean).join(' ');
  }

  private buildCaption(offer: OfferEntity, placeName: string): string {
    const parts: string[] = [];

    parts.push(`🔥 ${offer.title}`);

    if (offer.description) parts.push(`\n${offer.description}`);

    const discount = this.formatDiscount(offer);
    if (discount) parts.push(`\n💰 ${discount}`);

    const validTo = new Date(offer.validTo).toLocaleDateString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    parts.push(`📅 Válido hasta el ${validTo}`);

    if (placeName) {
      parts.push(`\n📍 ${placeName}`);
      const tag = placeName.toLowerCase().replace(/[^a-z0-9]/g, '');
      parts.push(`\n#oferta #picacerca${tag ? ` #${tag}` : ''}`);
    } else {
      parts.push('\n#oferta #picacerca');
    }

    return parts.join('\n');
  }

  private formatDiscount(offer: OfferEntity): string {
    switch (offer.discountType) {
      case DiscountType.PERCENTAGE:
        return offer.discountValue ? `${offer.discountValue}% de descuento` : 'Descuento especial';
      case DiscountType.FIXED:
        return offer.discountValue ? `$${offer.discountValue} de descuento` : 'Descuento fijo';
      case DiscountType.TWO_FOR_ONE:
        return '2x1';
      case DiscountType.FREE_ITEM:
        return 'Ítem gratis';
      default:
        return '';
    }
  }
}
