import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

import type { SafeUser } from '../users/types/users.types';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { LoginDTO } from './dto/login.dto';
import { PassportJwtGuard } from './guards/passport-jwt.guard';
import type { AuthenticatedUser, AuthResult } from './types/auth.types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  async loginUser(@Body() body: LoginDTO): Promise<AuthResult> {
    const result = await this.authService.loginUser(body);
    return result;
  }

  @Get('me')
  @UseGuards(PassportJwtGuard)
  async getUserInfo(@CurrentUser() user: AuthenticatedUser): Promise<SafeUser> {
    return user;
  }
}
