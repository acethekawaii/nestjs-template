import type { User } from '@prisma/client';

export type OrganizationUser = Pick<
  User,
  | 'id'
  | 'name'
  | 'email'
  | 'emailVerified'
  | 'image'
  | 'createdAt'
  | 'updatedAt'
>;
