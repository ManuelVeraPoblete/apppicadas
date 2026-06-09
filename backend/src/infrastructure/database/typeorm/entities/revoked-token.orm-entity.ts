import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

@Entity('revoked_tokens')
export class RevokedTokenOrmEntity {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  jti: string;

  @Index('IDX_revoked_tokens_expires_at')
  @Column({ name: 'expires_at', type: 'datetime' })
  expiresAt: Date;
}
