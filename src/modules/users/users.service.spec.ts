import { Test, TestingModule } from '@nestjs/testing';

import { PrismaService } from '../../core/database/prisma.service';
import { UsersService } from './users.service';

type ScopedUserQuery = {
  where: {
    id?: string;
    members: {
      some: {
        organizationId: string;
      };
    };
  };
};

describe('UsersService', () => {
  const findMany = jest.fn();
  const findFirst = jest.fn();

  let service: UsersService;

  beforeEach(async () => {
    findMany.mockReset();
    findFirst.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: {
            user: { findMany, findFirst },
          },
        },
      ],
    }).compile();

    service = module.get(UsersService);
  });

  it('scopes user listings to the active organization', async () => {
    findMany.mockImplementation(({ where }: ScopedUserQuery) =>
      Promise.resolve(
        where.members.some.organizationId === 'organization-a'
          ? [{ id: 'user-a' }]
          : [],
      ),
    );

    await expect(service.getAllUsers('organization-a')).resolves.toEqual([
      { id: 'user-a' },
    ]);
    await expect(service.getAllUsers('organization-b')).resolves.toEqual([]);
  });

  it('cannot get a user through another organization', async () => {
    findFirst.mockImplementation(({ where }: ScopedUserQuery) =>
      Promise.resolve(
        where.id === 'user-a' &&
          where.members.some.organizationId === 'organization-a'
          ? { id: 'user-a' }
          : null,
      ),
    );

    await expect(
      service.getUser('organization-a', 'user-a'),
    ).resolves.toEqual({ id: 'user-a' });
    await expect(
      service.getUser('organization-b', 'user-a'),
    ).resolves.toBeNull();
  });
});
