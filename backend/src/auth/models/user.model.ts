import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@ObjectType({ description: 'LeadFinder platform user' })
@Schema({ timestamps: true })
export class User {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  @Prop({ required: true, trim: true })
  name: string;

  @Field(() => String)
  @Prop({ required: true, unique: true, lowercase: true, trim: true, index: true })
  email: string;

  // Password hash is stored in DB, but omitted from GraphQL ObjectType for security
  @Prop({ required: true })
  password: string;

  @Field(() => String, { nullable: true })
  @Prop({ required: false, default: null })
  avatar?: string;

  @Field(() => String)
  @Prop({ required: true, default: 'USER' })
  role: string;

  @Field(() => String, { nullable: true })
  @Prop({ required: false, index: true })
  apiKey?: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Ensure index on email and apiKey
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ apiKey: 1 });
