export class ReviewReplyEntity {
  constructor(
    public readonly id: string,
    public reviewId: string,
    public ownerId: string,
    public comment: string,
    public readonly createdAt: Date,
  ) {}
}
