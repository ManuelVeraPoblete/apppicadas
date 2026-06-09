export interface IAiImageGenerationService {
  generateAndUpload(prompt: string, publicId: string): Promise<string>;
}

export const AI_IMAGE_GENERATION_SERVICE = Symbol('IAiImageGenerationService');
