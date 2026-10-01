import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { User, UserSchema } from './models/user.model';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { GqlAuthGuard } from './guards/gql-auth.guard';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'leadfinder_jwt_secret_token_key_2026',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  providers: [AuthService, AuthResolver, GqlAuthGuard],
  exports: [AuthService, JwtModule, GqlAuthGuard, MongooseModule],
})
export class AuthModule {}
