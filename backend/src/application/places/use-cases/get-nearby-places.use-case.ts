import { Inject, Injectable } from '@nestjs/common';
import {
  IPlaceRepository,
  NearbyResult,
  PLACE_REPOSITORY,
} from '../../../core/ports/repositories/place.repository.port';
import { NearbyQueryDto } from '../dtos/nearby-query.dto';

const DEFAULT_RADIUS_METERS = 3000;

@Injectable()
export class GetNearbyPlacesUseCase {
  constructor(
    @Inject(PLACE_REPOSITORY)
    private readonly placeRepository: IPlaceRepository,
  ) {}

  async execute(query: NearbyQueryDto): Promise<NearbyResult[]> {
    return this.placeRepository.findNearby({
      lat: query.lat,
      lng: query.lng,
      radius: query.radius ?? DEFAULT_RADIUS_METERS,
      categoryId: query.categoryId,
      priceRange: query.priceRange,
      page: query.page ?? 1,
      limit: query.limit ?? 20,
    });
  }
}
