import { InputType, Field, Float, Int } from '@nestjs/graphql';
import { IsOptional, IsString, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

@InputType()
export class ScrapedLeadInput {
  @Field(() => String)
  @IsString()
  name: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  category?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  address?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  phone?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  website?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  email?: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  rating?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  reviewCount?: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  googleMapsUrl?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  searchQuery?: string;
}

@InputType()
export class SyncFilterOptionsInput {
  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  noWebsiteOnly?: boolean;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  mustHavePhone?: boolean;

  @Field(() => String, { nullable: true })
  @IsOptional()
  maxRating?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  maxReviews?: string;
}

@InputType()
export class SyncLeadsInput {
  @Field(() => [ScrapedLeadInput])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ScrapedLeadInput)
  leads: ScrapedLeadInput[];

  @Field(() => SyncFilterOptionsInput, { nullable: true })
  @IsOptional()
  @Type(() => SyncFilterOptionsInput)
  filterOptions?: SyncFilterOptionsInput;
}

@InputType()
export class UpdateLeadStatusInput {
  @Field(() => String)
  @IsString()
  id: string;

  @Field(() => String)
  @IsString()
  status: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;
}
