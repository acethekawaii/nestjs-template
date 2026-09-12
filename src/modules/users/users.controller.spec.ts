import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import type { Auth } from '../auth/auth';
import type { UserSession } from '@thallesp/nestjs-better-auth';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

type OrganizationSession = UserSession<Auth> & {
  session: {
    activeOrganizationId: string;
  };
};

describe('UsersController', () => {
  const getUser = jest.fn<UsersService['getUser']>();

  let controller: UsersController;

  const session = {
    session: { activeOrganizationId: 'organization-a' },
  } as OrganizationSession;

  beforeEach(async () => {
    getUser.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: { getUser },
        },
      ],
    }).compile();

    controller = module.get(UsersController);
  });

  it('returns not found for users outside the active organization', async () => {
    getUser.mockResolvedValue(null);

    await expect(controller.getUser('user-b', session)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(getUser).toHaveBeenCalledWith('organization-a', 'user-b');
  });
});
