import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';

import { PrismaService } from '../../core/database/prisma.service';
import type { OrganizationUser } from './types/users.types';

const ORGANIZATION_USER_SELECT = {
  id: true,
  name: true,
  email: true,
  emailVerified: true,
  image: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  getAllUsers(organizationId: string): Promise<OrganizationUser[]> {
    return this.prisma.user.findMany({
      where: {
        members: {
          some: { organizationId },
        },
      },
      select: ORGANIZATION_USER_SELECT,
      orderBy: { createdAt: 'asc' },
    });
  }

  getUser(
    organizationId: string,
    id: string,
  ): Promise<OrganizationUser | null> {
    return this.prisma.user.findFirst({
      where: {
        id,
        members: {
          some: { organizationId },
        },
      },
      select: ORGANIZATION_USER_SELECT,
    });
  }
}
