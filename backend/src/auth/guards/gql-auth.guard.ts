import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../models/user.model';

@Injectable()
export class GqlAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const { req } = ctx.getContext();

    if (!req) {
      throw new UnauthorizedException('Request context not available');
    }

    // 1. Check API Key header
    const apiKey = req.headers?.['x-api-key'] || req.headers?.['X-API-KEY'];
    if (apiKey && typeof apiKey === 'string') {
      const userByApiKey = await this.userModel.findOne({ apiKey }).select('-password').exec();
      if (userByApiKey) {
        req.user = userByApiKey;
        return true;
      }
    }

    // 2. Extract JWT token from Authorization Header, Cookie, or Custom Headers
    let token: string | null = null;
    const authHeader = req.headers?.authorization || req.headers?.Authorization;

    if (authHeader && typeof authHeader === 'string') {
      const parts = authHeader.split(' ');
      if (parts.length === 2 && parts[0] === 'Bearer') {
        token = parts[1];
      } else {
        token = authHeader;
      }
    }

    // Check cookie if token not in authorization header
    if (!token && req.cookies?.leadfinder_token) {
      token = req.cookies.leadfinder_token;
    }

    // Check secondary auth headers
    if (!token && (req.headers?.['x-auth-token'] || req.headers?.['x-user-token'])) {
      token = (req.headers['x-auth-token'] || req.headers['x-user-token']) as string;
    }

    if (!token) {
      throw new UnauthorizedException('Authentication required. Please log in or provide an authorization token.');
    }

    try {
      const payload = this.jwtService.verify(token);
      const user = await this.userModel.findById(payload.sub).select('-password').exec();

      if (!user) {
        throw new UnauthorizedException('User account no longer exists');
      }

      req.user = user;
      return true;
    } catch (err: any) {
      throw new UnauthorizedException(err.message || 'Invalid or expired session token. Please log in again.');
    }
  }
}

