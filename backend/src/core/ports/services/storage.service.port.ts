export interface UploadResult {
  url: string;
  publicId: string;
}

export interface IStorageService {
  upload(file: Express.Multer.File, folder: string, publicId?: string): Promise<UploadResult>;
  uploadBuffer(buffer: Buffer, folder: string, publicId?: string): Promise<UploadResult>;
  delete(publicId: string): Promise<void>;
}

export const STORAGE_SERVICE = Symbol('IStorageService');
