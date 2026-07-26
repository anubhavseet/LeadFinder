import { ObjectType, Field, Int, Float } from '@nestjs/graphql';
import { Lead } from '../models/lead.model';

@ObjectType()
export class LeadStats {
  @Field(() => Int)
  totalLeads: number;

  @Field(() => Int)
  noWebsiteCount: number;

  @Field(() => Int)
  lowRatingCount: number;

  @Field(() => Int)
  lowReviewsCount: number;

  @Field(() => Float)
  avgOpportunityScore: number;

  @Field(() => Int)
  highPriorityLeadsCount: number;
}

@ObjectType()
export class PaginatedLeads {
  @Field(() => [Lead])
  items: Lead[];

  @Field(() => Int)
  totalCount: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  totalPages: number;
}

@ObjectType()
export class SyncLeadsResult {
  @Field(() => Int)
  addedCount: number;

  @Field(() => Int)
  updatedCount: number;

  @Field(() => Int)
  totalProcessed: number;
}
