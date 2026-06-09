import { Inject, Injectable, ForbiddenException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import {
  IPlaceRepository,
  PLACE_REPOSITORY,
} from '../../../core/ports/repositories/place.repository.port';
import { CreatePlaceDto } from '../dtos/create-place.dto';
import { PlaceEntity } from '../../../core/domain/entities/place.entity';
import { UserRole } from '../../../core/domain/enums/user-role.enum';
import { JwtPayload } from '../../../presentation/shared/decorators/current-user.decorator';

@Injectable()
export class CreatePlaceUseCase {
  constructor(
    @Inject(PLACE_REPOSITORY)
    private readonly placeRepository: IPlaceRepository,
  ) {}

  async execute(dto: CreatePlaceDto, currentUser: JwtPayload): Promise<PlaceEntity> {
    if (currentUser.role !== UserRole.OWNER) {
      throw new ForbiddenException('Solo los dueños de local pueden crear lugares');
    }

    const place = new PlaceEntity(
      uuidv4(),
      dto.name,
      dto.categoryId,
      dto.address,
      dto.city,
      dto.latitude,
      dto.longitude,
      dto.priceRange,
      currentUser.sub,
      true,
      false,
      0,
      0,
      new Date(),
      new Date(),
      dto.description,
      dto.phone,
      dto.website,
      dto.instagram,
    );

    return this.placeRepository.save(place);
  }
}
