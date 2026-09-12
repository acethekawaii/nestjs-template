import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import * as bcrypt from 'bcrypt';

import { UsersService } from '../users/users.service';
import type { LoginDTO } from './dto/login.dto';
import type { AuthResult } from './types/auth.types';

// Pre-computed bcrypt hash of a random string. Used to keep timing constant
// when the user lookup misses, so attackers can't enumerate accounts.
const DUMMY_HASH = '$2b$10$CwTycUXWue0Thq9StjUM0uJ8.D6Z/3p1zVcr7e9LpO5z9C5jM1qWG';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService
  ) {}

  async loginUser(body: LoginDTO): Promise<AuthResult> {
    const user = await this.usersService.getUserByEmail(body.email);
    const isPasswordValid = await bcrypt.compare(
      body.password,
      user?.password ?? DUMMY_HASH,
    );

    if (!user || user.isArchived || !isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
    });

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      accessToken,
    };
  }
}
