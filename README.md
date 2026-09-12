# backend-boilerplate

NestJS starter with PostgreSQL, Prisma, Better Auth, and organization based multi-tenancy.

## Requirements

- Node.js 22.22.1 or newer
- pnpm 12
- PostgreSQL

## Setup

```bash
pnpm install --frozen-lockfile
```

Copy `.env.example` to `.env`, then set:

```env
NODE_ENV=development
PORT=8000
DATABASE_URL=postgresql://postgres:password@localhost:5432/backend_boilerplate?schema=public
BETTER_AUTH_SECRET=replace-with-at-least-32-random-characters
BETTER_AUTH_URL=http://localhost:8000
CORS_ALLOWED_ORIGINS=http://localhost:4200
```

Prepare the database and start the API:

```bash
pnpm exec prisma migrate dev
pnpm start:dev
```

The API is available at `http://localhost:8000/api/v1`.

## Authentication

Better Auth is mounted at `/api/v1/auth`. Email and password sign-up, sign-in, sign-out, sessions, organizations, members, and invitations use the standard [Better Auth API](https://www.better-auth.com/docs).

Sessions use HTTP-only cookies. Browser clients must send requests with credentials enabled.

Nest routes are protected globally. Public routes use `@AllowAnonymous()`. Organization routes use the integration's organization decorators and scope every database query by the active organization.

Each user can belong to one organization. Better Auth hooks reject extra memberships, and the database enforces the invariant with a unique membership constraint.

Public routes:

- `GET /api/v1`
- `GET /api/v1/health`
- Better Auth authentication routes

Organization scoped routes:

- `GET /api/v1/users`
- `GET /api/v1/users/:id`

## Scripts

```bash
pnpm start:dev
pnpm build
pnpm test
pnpm test:e2e
pnpm lint
```

## License

[MIT](LICENSE)
