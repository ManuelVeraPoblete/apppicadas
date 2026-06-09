import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LocalStorageService } from './local/local-storage.service';
import { STORAGE_SERVICE } from '../../core/ports/services/storage.service.port';

@Module({
  imports: [ConfigModule],
  providers: [{ provide: STORAGE_SERVICE, useClass: LocalStorageService }],
  exports: [STORAGE_SERVICE],
})
export class StorageModule {}
