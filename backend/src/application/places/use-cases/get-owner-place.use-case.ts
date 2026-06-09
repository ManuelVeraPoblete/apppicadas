import { Inject, Injectable } from '@nestjs/common';
import {
  IPlaceRepository,
  PLACE_REPOSITORY,
} from '../../../core/ports/repositories/place.repository.port';
import { PlaceEntity } from '../../../core/domain/entities/place.entity';

@Injectable()
export class GetOwnerPlaceUseCase {
  constructor(
    @Inject(PLACE_REPOSITORY)
    private readonly placeRepository: IPlaceRepository,
  ) {}

  async execute(ownerId: string): Promise<PlaceEntity | null> {
    return this.placeRepository.findByOwnerId(ownerId);
  }
}
