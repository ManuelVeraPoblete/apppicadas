import {
  Inject,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import {
  IPlaceRepository,
  PLACE_REPOSITORY,
} from '../../../core/ports/repositories/place.repository.port';
import { UpdatePlaceDto } from '../dtos/update-place.dto';
import { PlaceEntity } from '../../../core/domain/entities/place.entity';
import { PlaceNotFoundException } from '../../../core/domain/exceptions/domain.exceptions';
import { UserRole } from '../../../core/domain/enums/user-role.enum';
import { JwtPayload } from '../../../presentation/shared/decorators/current-user.decorator';

@Injectable()
export class UpdatePlaceUseCase {
  constructor(
    @Inject(PLACE_REPOSITORY)
    private readonly placeRepository: IPlaceRepository,
  ) {}

  async execute(id: string, dto: UpdatePlaceDto, currentUser: JwtPayload): Promise<PlaceEntity> {
    const place = await this.placeRepository.findById(id);
    if (!place) {
      throw new PlaceNotFoundException(id);
    }

    // Solo el dueño del local puede editar — o un ADMIN
    const isOwner = place.createdById === currentUser.sub;
    const isAdmin = currentUser.role === UserRole.ADMIN;

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('Solo el dueño del local puede editarlo');
    }

    return this.placeRepository.update(id, dto);
  }
}
