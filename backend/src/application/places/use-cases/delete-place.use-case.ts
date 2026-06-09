import { Inject, Injectable, ForbiddenException } from '@nestjs/common';
import {
  IPlaceRepository,
  PLACE_REPOSITORY,
} from '../../../core/ports/repositories/place.repository.port';
import { PlaceNotFoundException } from '../../../core/domain/exceptions/domain.exceptions';
import { UserRole } from '../../../core/domain/enums/user-role.enum';
import { JwtPayload } from '../../../presentation/shared/decorators/current-user.decorator';

@Injectable()
export class DeletePlaceUseCase {
  constructor(
    @Inject(PLACE_REPOSITORY)
    private readonly placeRepository: IPlaceRepository,
  ) {}

  async execute(id: string, currentUser: JwtPayload): Promise<void> {
    const place = await this.placeRepository.findById(id);
    if (!place) {
      throw new PlaceNotFoundException(id);
    }

    const isOwner = place.createdById === currentUser.sub;
    const isAdmin = currentUser.role === UserRole.ADMIN;

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('Solo el dueño del local puede eliminarlo');
    }

    await this.placeRepository.softDelete(id);
  }
}
