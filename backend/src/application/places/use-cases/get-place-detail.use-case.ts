import { Inject, Injectable } from '@nestjs/common';
import {
  IPlaceRepository,
  PLACE_REPOSITORY,
} from '../../../core/ports/repositories/place.repository.port';
import { PlaceEntity } from '../../../core/domain/entities/place.entity';
import { PlaceNotFoundException } from '../../../core/domain/exceptions/domain.exceptions';

@Injectable()
export class GetPlaceDetailUseCase {
  constructor(
    @Inject(PLACE_REPOSITORY)
    private readonly placeRepository: IPlaceRepository,
  ) {}

  async execute(id: string): Promise<PlaceEntity> {
    const place = await this.placeRepository.findById(id);
    if (!place) {
      throw new PlaceNotFoundException(id);
    }
    return place;
  }
}
