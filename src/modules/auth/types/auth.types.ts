import type { User } from '@prisma/client';
import type { SafeUser } from '../../users/types/users.types';

export type JwtPayload = {
  sub: string;
};

export type AuthenticatedUser = SafeUser;

export type LoginUser = Pick<User, 'id' | 'email' | 'firstName' | 'lastName' | 'role'>;

export type AuthResult = LoginUser & {
  accessToken: string;
};
