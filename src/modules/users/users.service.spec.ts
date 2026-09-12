import { Test, TestingModule } from '@nestjs/testing';

import { PrismaService } from '../../core/database/prisma.service';
import { UsersService } from './users.service';

describe('UsersService', () => {
  const findUnique =
    jest.fn<(args: unknown) => Promise<null>>();

  let service: UsersService;

  beforeEach(async () => {
    findUnique.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: {
            user: { findUnique },
          },
        },
      ],
    }).compile();

    service = module.get(UsersService);
  });

  it('normalizes email before looking up a user', async () => {
    findUnique.mockResolvedValue(null);

    await service.getUserByEmail(' Admin@Example.com ');

    expect(findUnique).toHaveBeenCalledWith({
      where: { email: 'admin@example.com' },
    });
  });
});
