import { Inject, Injectable, ConflictException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcryptjs';
import { IUserRepository, USER_REPOSITORY } from '../../../core/ports/repositories/user.repository.port';
import { RegisterDto } from '../dtos/register.dto';
import { UserEntity } from '../../../core/domain/entities/user.entity';
import { UserRole } from '../../../core/domain/enums/user-role.enum';

@Injectable()
export class RegisterUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(dto: RegisterDto): Promise<UserEntity> {
    const existing = await this.userRepository.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Ya existe una cuenta con ese email');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = new UserEntity(
      uuidv4(),
      dto.name,
      dto.email,
      passwordHash,
      dto.role ?? UserRole.USER,
      true,
      new Date(),
      new Date(),
    );

    return this.userRepository.save(user);
  }
}
