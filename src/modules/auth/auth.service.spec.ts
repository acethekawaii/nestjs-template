import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import type { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';

import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  const getUserByEmail = jest.fn<UsersService['getUserByEmail']>();
  const signAsync =
    jest.fn<(payload: { sub: string }) => Promise<string>>();

  let service: AuthService;

  beforeEach(async () => {
    getUserByEmail.mockReset();
    signAsync.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: { getUserByEmail },
        },
        {
          provide: JwtService,
          useValue: { signAsync },
        },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('issues a token containing only the current user subject', async () => {
    const user: User = {
      id: '92b3b9dd-a55c-4e05-af32-c1991ed5e0ee',
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@example.com',
      password: await bcrypt.hash('valid-password', 4),
      role: 'ADMIN',
      isArchived: false,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    };
    getUserByEmail.mockResolvedValue(user);
    signAsync.mockResolvedValue('access-token');

    await expect(
      service.loginUser({
        email: user.email,
        password: 'valid-password',
      }),
    ).resolves.toEqual({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      accessToken: 'access-token',
    });

    expect(signAsync).toHaveBeenCalledWith({ sub: user.id });
  });
});
