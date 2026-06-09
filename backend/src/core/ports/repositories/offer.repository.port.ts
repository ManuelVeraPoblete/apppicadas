import { OfferEntity } from '../../domain/entities/offer.entity';

export interface IOfferRepository {
  save(offer: OfferEntity): Promise<OfferEntity>;
  findByPlaceId(placeId: string, onlyActive?: boolean): Promise<OfferEntity[]>;
  findById(id: string): Promise<OfferEntity | null>;
  update(id: string, data: Partial<OfferEntity>): Promise<OfferEntity>;
  delete(id: string): Promise<void>;
}

export const OFFER_REPOSITORY = Symbol('IOfferRepository');
