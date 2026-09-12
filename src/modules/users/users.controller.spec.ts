import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  const getUser = jest.fn<UsersService['getUser']>();

  let controller: UsersController;

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

  it('returns not found when the user does not exist', async () => {
    getUser.mockResolvedValue(null);

    await expect(
      controller.getUser('92b3b9dd-a55c-4e05-af32-c1991ed5e0ee'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
