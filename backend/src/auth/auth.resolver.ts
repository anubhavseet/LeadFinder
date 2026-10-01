import { Resolver, Mutation, Query, Args, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from './models/user.model';
import { SignUpInput, LoginInput, UpdateProfileInput, AuthPayload } from './dto/auth.dto';
import { GqlAuthGuard } from './guards/gql-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';

@Resolver(() => User)
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => AuthPayload, { description: 'Register a new user account' })
  async register(
    @Args('input') input: SignUpInput,
    @Context() context: any,
  ): Promise<AuthPayload> {
    const result = await this.authService.register(input);
    if (context?.res?.cookie) {
      context.res.cookie('leadfinder_token', result.token, {
        httpOnly: false,
        sameSite: 'lax',
        path: '/',
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });
    }
    return result;
  }

  @Mutation(() => AuthPayload, { description: 'Authenticate an existing user' })
  async login(
    @Args('input') input: LoginInput,
    @Context() context: any,
  ): Promise<AuthPayload> {
    const result = await this.authService.login(input);
    if (context?.res?.cookie) {
      context.res.cookie('leadfinder_token', result.token, {
        httpOnly: false,
        sameSite: 'lax',
        path: '/',
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });
    }
    return result;
  }

  @Mutation(() => Boolean, { description: 'Clear session cookie and log out' })
  async logout(@Context() context: any): Promise<boolean> {
    if (context?.res?.clearCookie) {
      context.res.clearCookie('leadfinder_token', { path: '/' });
    }
    return true;
  }


  @Query(() => User, { description: 'Fetch currently authenticated user profile' })
  @UseGuards(GqlAuthGuard)
  async me(@CurrentUser() user: User): Promise<User> {
    return this.authService.validateUserById(user.id || (user as any)._id);
  }

  @Mutation(() => User, { description: 'Update current user profile info or password' })
  @UseGuards(GqlAuthGuard)
  async updateProfile(
    @CurrentUser() user: User,
    @Args('input') input: UpdateProfileInput,
  ): Promise<User> {
    const userId = user.id || (user as any)._id;
    return this.authService.updateProfile(userId, input);
  }

  @Mutation(() => User, { description: 'Regenerate API key for Chrome extension & external tools' })
  @UseGuards(GqlAuthGuard)
  async regenerateApiKey(@CurrentUser() user: User): Promise<User> {
    const userId = user.id || (user as any)._id;
    return this.authService.regenerateApiKey(userId);
  }
}
