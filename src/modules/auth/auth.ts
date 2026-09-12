import { prismaAdapter } from '@better-auth/prisma-adapter';
import * as bcrypt from 'bcrypt';
import { APIError } from 'better-auth/api';
import { betterAuth } from 'better-auth';
import { hashPassword, verifyPassword } from 'better-auth/crypto';
import { organization } from 'better-auth/plugins';

import { env } from '../../core/config/env.config';
import { prisma } from '../../core/database/prisma.service';

const SINGLE_ORGANIZATION_MESSAGE = 'Users can belong to only one organization';

async function ensureUserHasNoOrganization(userId: string): Promise<void> {
  const membership = await prisma.member.findFirst({
    where: { userId },
    select: { id: true },
  });

  if (membership) {
    throw new APIError('FORBIDDEN', {
      message: SINGLE_ORGANIZATION_MESSAGE,
    });
  }
}

// The migration keeps legacy bcrypt hashes. New passwords use Better Auth's scrypt.

async function verifyPasswordHash(credentials: {
  hash: string;
  password: string;
}): Promise<boolean> {
  if (credentials.hash.startsWith('$2')) {
    return bcrypt.compare(credentials.password, credentials.hash);
  }

  return verifyPassword(credentials);
}

export const auth = betterAuth({
  appName: 'backend-boilerplate',
  baseURL: env.BETTER_AUTH_URL,
  basePath: '/api/v1/auth',
  secret: env.BETTER_AUTH_SECRET,
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
    password: {
      hash: hashPassword,
      verify: verifyPasswordHash,
    },
  },
  trustedOrigins: env.CORS_ALLOWED_ORIGINS,
  rateLimit: {
    enabled: true,
    storage: 'database',
  },
  advanced: {
    database: {
      joins: true,
    },
  },
  plugins: [
    organization({
      organizationLimit: 1,
      organizationHooks: {
        beforeCreateInvitation: async ({ invitation }) => {
          const invitedUser = await prisma.user.findUnique({
            where: { email: invitation.email.toLowerCase() },
            select: { id: true },
          });

          if (invitedUser) {
            await ensureUserHasNoOrganization(invitedUser.id);
          }
        },
        beforeAddMember: async ({ user }) => {
          await ensureUserHasNoOrganization(user.id);
        },
        beforeAcceptInvitation: async ({ user }) => {
          await ensureUserHasNoOrganization(user.id);
        },
      },
    }),
  ],
});

export type Auth = typeof auth;
