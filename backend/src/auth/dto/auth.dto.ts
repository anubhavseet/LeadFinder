import { InputType, ObjectType, Field } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, MinLength, IsOptional } from 'class-validator';
import { User } from '../models/user.model';

@InputType({ description: 'Registration credentials input' })
export class SignUpInput {
  @Field(() => String)
  @IsNotEmpty({ message: 'Name is required' })
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  name: string;

  @Field(() => String)
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @Field(() => String)
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;
}

@InputType({ description: 'Login credentials input' })
export class LoginInput {
  @Field(() => String)
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @Field(() => String)
  @IsNotEmpty({ message: 'Password is required' })
  password: string;
}

@InputType({ description: 'Update profile input' })
export class UpdateProfileInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  name?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  avatar?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  currentPassword?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @MinLength(6, { message: 'New password must be at least 6 characters long' })
  newPassword?: string;
}

@ObjectType({ description: 'Authentication response payload containing JWT token and user' })
export class AuthPayload {
  @Field(() => String)
  token: string;

  @Field(() => User)
  user: User;
}
