import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { RoleEnum, type User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import request from 'supertest';
import type { App } from 'supertest/types';

import { AppModule } from '../../app.module';
import { PrismaService } from '../../core/database/prisma.service';
import type { SafeUser } from '../users/types/users.types';

type FindUniqueArgs = {
  where: {
    email?: string;
    id?: string;
  };
  omit?: {
    password?: boolean;
  };
};

describe('AuthController', () => {
  const email = 'admin@example.com';
  const password = 'valid-password';
  const findUnique =
    jest.fn<(args: FindUniqueArgs) => Promise<SafeUser | User | null>>();

  let app: INestApplication<App>;
  let jwtService: JwtService;
  let passwordHash: string;

  const createUser = (isArchived: boolean): User => ({
    id: '92b3b9dd-a55c-4e05-af32-c1991ed5e0ee',
    firstName: 'Admin',
    lastName: 'User',
    email,
    password: passwordHash,
    role: RoleEnum.ADMIN,
    isArchived,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  });

  beforeAll(async () => {
    passwordHash = await bcrypt.hash(password, 4);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({
        user: {
          findUnique,
        },
      })
      .compile();

    app = moduleFixture.createNestApplication();
    jwtService = moduleFixture.get(JwtService);
    await app.init();
  });

  beforeEach(() => {
    findUnique.mockReset();
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns the login resource without a success envelope', async () => {
    findUnique.mockResolvedValue(createUser(false));

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password })
      .expect(201);

    const responseBody: unknown = response.body;
    expect(responseBody).toMatchObject({
      id: '92b3b9dd-a55c-4e05-af32-c1991ed5e0ee',
      firstName: 'Admin',
      lastName: 'User',
      email,
      role: 'ADMIN',
    });
    expect(responseBody).toHaveProperty('accessToken');
    expect(responseBody).not.toHaveProperty('data');
    expect(responseBody).not.toHaveProperty('statusCode');
  });

  it('rejects malformed login bodies before user lookup', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'invalid-email', password })
      .expect(400);

    expect(findUnique).not.toHaveBeenCalled();
  });

  it('rejects an archived user password login', async () => {
    findUnique.mockResolvedValue(createUser(true));

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password })
      .expect(401);
  });

  it('rejects an archived user access token', async () => {
    const archivedUser = createUser(true);
    const safeUser: SafeUser = {
      id: archivedUser.id,
      firstName: archivedUser.firstName,
      lastName: archivedUser.lastName,
      email: archivedUser.email,
      role: archivedUser.role,
      isArchived: archivedUser.isArchived,
      createdAt: archivedUser.createdAt,
      updatedAt: archivedUser.updatedAt,
    };
    findUnique.mockResolvedValue(safeUser);

    const accessToken = await jwtService.signAsync({
      sub: archivedUser.id,
      email: archivedUser.email,
      role: archivedUser.role,
    });

    await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(401);
  });
});
