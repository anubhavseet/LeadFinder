import { ObjectType, Field, ID, Float, Int } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LeadDocument = Lead & Document;

@ObjectType({ description: 'Local business lead extracted from Google Maps' })
@Schema({ timestamps: true })
export class Lead {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  @Prop({ required: true, index: true })
  name: string;

  @Field(() => String, { nullable: true })
  @Prop({ required: false })
  category?: string;

  @Field(() => String, { nullable: true })
  @Prop({ required: false })
  address?: string;

  @Field(() => String, { nullable: true })
  @Prop({ required: false })
  phone?: string;

  @Field(() => String, { nullable: true })
  @Prop({ required: false, default: null })
  website?: string;

  @Field(() => String, { nullable: true })
  @Prop({ required: false, default: null })
  email?: string;

  @Field(() => String, { nullable: true })
  @Prop({ required: false, default: null })
  emailSource?: string;

  @Field(() => Float, { nullable: true })
  @Prop({ required: false })
  rating?: number;

  @Field(() => Int, { nullable: true })
  @Prop({ required: false })
  reviewCount?: number;

  @Field(() => String, { nullable: true })
  @Prop({ required: false })
  googleMapsUrl?: string;

  @Field(() => Int)
  @Prop({ required: true, default: 0, index: true })
  opportunityScore: number;

  @Field(() => [String])
  @Prop({ type: [String], default: [] })
  opportunityTags: string[];

  @Field(() => String, { nullable: true })
  @Prop({ required: false, index: true })
  searchQuery?: string;

  @Field(() => String)
  @Prop({ required: true, default: 'NEW', index: true })
  status: string;

  @Field(() => String, { nullable: true })
  @Prop({ required: false, default: '' })
  notes?: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

export const LeadSchema = SchemaFactory.createForClass(Lead);
