import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { User, UserDocument } from './models/user.model';
import { SignUpInput, LoginInput, UpdateProfileInput, AuthPayload } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
  ) {}

  private generateApiKey(): string {
    return `lf_${crypto.randomBytes(20).toString('hex')}`;
  }

  private generateToken(user: UserDocument): string {
    const payload = {
      sub: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    };
    return this.jwtService.sign(payload);
  }

  async register(input: SignUpInput): Promise<AuthPayload> {
    const normalizedEmail = input.email.trim().toLowerCase();

    // Check existing email
    const existing = await this.userModel.findOne({ email: normalizedEmail }).exec();
    if (existing) {
      throw new ConflictException('An account with this email address already exists');
    }

    const hashedPassword = await bcrypt.hash(input.password, 10);
    const apiKey = this.generateApiKey();

    const newUser = new this.userModel({
      name: input.name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: 'USER',
      apiKey,
    });

    const savedUser = await newUser.save();
    const token = this.generateToken(savedUser);

    return {
      token,
      user: savedUser,
    };
  }

  async login(input: LoginInput): Promise<AuthPayload> {
    const normalizedEmail = input.email.trim().toLowerCase();
    const user = await this.userModel.findOne({ email: normalizedEmail }).exec();

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(input.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Ensure user has an apiKey if older account without one
    if (!user.apiKey) {
      user.apiKey = this.generateApiKey();
      await user.save();
    }

    const token = this.generateToken(user);

    return {
      token,
      user,
    };
  }

  async validateUserById(id: string): Promise<User> {
    const user = await this.userModel.findById(id).select('-password').exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async updateProfile(userId: string, input: UpdateProfileInput): Promise<User> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (input.name && input.name.trim()) {
      user.name = input.name.trim();
    }

    if (input.avatar !== undefined) {
      user.avatar = input.avatar;
    }

    if (input.newPassword) {
      if (!input.currentPassword) {
        throw new BadRequestException('Current password is required to set a new password');
      }

      const isCurrentMatch = await bcrypt.compare(input.currentPassword, user.password);
      if (!isCurrentMatch) {
        throw new UnauthorizedException('Current password does not match');
      }

      user.password = await bcrypt.hash(input.newPassword, 10);
    }

    const updatedUser = await user.save();
    return updatedUser;
  }

  async regenerateApiKey(userId: string): Promise<User> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.apiKey = this.generateApiKey();
    return await user.save();
  }

  async findByApiKey(apiKey: string): Promise<User | null> {
    if (!apiKey) return null;
    return await this.userModel.findOne({ apiKey }).select('-password').exec();
  }
}
