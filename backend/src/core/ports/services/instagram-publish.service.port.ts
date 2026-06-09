export interface InstagramPublishParams {
  imageUrl: string;
  caption: string;
  /** Token del owner. Si se omite, usa el token global del .env. */
  accessToken?: string;
  /** IG User ID del owner. Si se omite, usa el del .env. */
  instagramUserId?: string;
}

export interface IInstagramPublishService {
  publish(params: InstagramPublishParams): Promise<string>;
}

export const INSTAGRAM_PUBLISH_SERVICE = Symbol('IInstagramPublishService');
