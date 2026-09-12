import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

type AuthenticatedRequest<T> = Request & {
  user: T;
};

export const CurrentUser = createParamDecorator(
  <T>(_data: unknown, ctx: ExecutionContext): T => {
    const request = ctx
      .switchToHttp()
      .getRequest<AuthenticatedRequest<T>>();
    return request.user;
  },
);
