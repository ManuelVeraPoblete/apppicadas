import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  IInstagramPublishService,
  InstagramPublishParams,
} from '../../core/ports/services/instagram-publish.service.port';

interface MetaErrorBody {
  message: string;
  type: string;
  code: number;
  error_subcode?: number;
}

export class MetaApiError extends Error {
  constructor(
    public readonly meta: MetaErrorBody,
  ) {
    super(`Meta API error ${meta.code}: ${meta.message}`);
    this.name = 'MetaApiError';
  }
}

@Injectable()
export class InstagramPublishService implements IInstagramPublishService {
  private readonly baseUrl: string;
  private readonly defaultToken: string;
  private readonly defaultUserId: string;

  constructor(private readonly config: ConfigService) {
    const version = config.get<string>('META_GRAPH_API_VERSION', 'v21.0');
    this.baseUrl = `https://graph.instagram.com/${version}`;
    this.defaultToken = config.getOrThrow<string>('META_INSTAGRAM_ACCESS_TOKEN');
    this.defaultUserId = config.getOrThrow<string>('META_INSTAGRAM_USER_ID');
  }

  async publish({ imageUrl, caption, accessToken, instagramUserId }: InstagramPublishParams): Promise<string> {
    const token  = accessToken    ?? this.defaultToken;
    const userId = instagramUserId ?? this.defaultUserId;

    const containerId = await this.createContainer(userId, imageUrl, caption, token);
    return this.publishContainer(userId, containerId, token);
  }

  private async createContainer(
    userId: string,
    imageUrl: string,
    caption: string,
    token: string,
  ): Promise<string> {
    const res = await fetch(`${this.baseUrl}/${userId}/media`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ image_url: imageUrl, caption, access_token: token }),
    });
    const data = (await res.json()) as { id?: string; error?: MetaErrorBody };
    if (data.error) throw new MetaApiError(data.error);
    return data.id!;
  }

  private async publishContainer(
    userId: string,
    containerId: string,
    token: string,
  ): Promise<string> {
    const res = await fetch(`${this.baseUrl}/${userId}/media_publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ creation_id: containerId, access_token: token }),
    });
    const data = (await res.json()) as { id?: string; error?: MetaErrorBody };
    if (data.error) throw new MetaApiError(data.error);
    return data.id!;
  }
}
