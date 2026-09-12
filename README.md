# backend-boilerplate

An opinionated NestJS starter for admin dashboards, internal tools, CRUD APIs, and MVP backends.

Ships agent-ready for Claude Code, Cursor, and Codex through canonical project guidance in `AGENTS.md` and a focused NestJS naming skill.

![NestJS 11](https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs&logoColor=white)
![Prisma 7](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-database-4169E1?logo=postgresql&logoColor=white)
![TypeScript 5](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Jest 30](https://img.shields.io/badge/Jest-30-C21325?logo=jest&logoColor=white)
![pnpm 12](https://img.shields.io/badge/pnpm-12-F69220?logo=pnpm&logoColor=white)
![MIT](https://img.shields.io/badge/license-MIT-green)

## Use this template

1. Click **Use this template**, then **Create a new repository** at the top of this repository.
2. Clone your repository and install dependencies:

```bash
git clone https://github.com/<your-username>/<your-repo-name>.git
cd <your-repo-name>
pnpm install --frozen-lockfile
```

3. Create your environment file:

macOS or Linux:

```bash
cp .env.example .env
```

PowerShell:

```powershell
Copy-Item .env.example .env
```

4. Set the local environment:

```env
NODE_ENV=development
PORT=8000
DATABASE_URL=postgresql://postgres:password@localhost:5432/my_database?schema=public
JWT_SECRET=replace-with-at-least-32-characters
CORS_ALLOWED_ORIGINS=http://localhost:4200
```

5. Prepare the database and start the API:

```bash
pnpm exec prisma migrate dev
pnpm exec prisma db seed
pnpm start:dev
```

The starter endpoint is available at `http://localhost:8000/api/v1`.

```bash
curl http://localhost:8000/api/v1
curl http://localhost:8000/api/v1/health
```

The first request confirms the HTTP setup. The health request also checks the PostgreSQL connection.

> [!TIP]
> **Outdated template?**
> Give this prompt to your coding assistant:
> ```text
> Update all dependencies to their latest stable compatible versions.
> Check NestJS, Prisma, TypeScript, ESLint, and Jest peer ranges first.
> Use pnpm, regenerate Prisma Client, then run lint, typecheck, and tests.
> ```

## After cloning

1. **`package.json`**: replace the package name, description, author, and version.
2. **`AGENTS.md`**: replace template assumptions with your product's modules, invariants, and verification requirements.
3. **`.env`**: configure the database, JWT secret, port, and allowed origins.
4. **`prisma/seed.ts`**: replace the default admin credentials.
5. **`prisma/schema.prisma`**: add the product data model, then create a migration.
6. Remove `AppController`, `AppService`, and their smoke tests after the first real feature replaces them.

## What's wired up

- `src/main.ts`: `/api/v1` routing, Helmet, CORS, shutdown hooks, and application startup
- `src/app.module.ts`: global DTO validation, shared exception formatting, and rate limiting
- `src/modules/auth/`: email/password login, bcrypt verification, Passport JWT guard, and current-user decorator
- `src/modules/users/`: authenticated user creation, listing, and lookup
- `src/core/config/`: Zod-validated environment variables
- `src/core/database/`: shared Prisma service using the PostgreSQL driver adapter
- `src/core/health/`: Terminus health check backed by a real database ping
- `prisma/`: schema, migration history, and local admin seed
- `AGENTS.md` and `.claude/`: shared agent contracts and focused NestJS naming guidance

Authentication defaults are intentionally narrow:

- No public registration endpoint
- JWT payloads contain only the user ID in `sub`
- Every authenticated request reloads the current safe user from PostgreSQL
- Archived users are rejected during login and JWT validation
- Password hashes are excluded from API resources

## Default admin

`pnpm exec prisma db seed` creates the local bootstrap account:

| Field | Value |
| --- | --- |
| Email | `admin@geoplan.ph` |
| Password | `admin123` |
| Role | `SUPER_ADMIN` |

> [!WARNING]
> Replace these credentials in `prisma/seed.ts` before sharing an environment. Never run the development seed against production.

## API

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/api/v1` | Public | Starter smoke response |
| `POST` | `/api/v1/auth/login` | Public | Exchange email and password for a JWT |
| `GET` | `/api/v1/auth/me` | JWT | Return the current safe user |
| `POST` | `/api/v1/users` | JWT | Create a user |
| `GET` | `/api/v1/users` | JWT | List users |
| `GET` | `/api/v1/users/:id` | JWT | Get a user by ID |
| `GET` | `/api/v1/health` | Public | Check the API and database |

Successful handlers return plain resources. `HttpExceptionFilter` owns the shared error response format.

## Scripts

```bash
pnpm start          # start once
pnpm start:dev      # start in watch mode
pnpm start:debug    # start in debug watch mode
pnpm build          # compile into dist
pnpm start:prod     # run the compiled application
pnpm test           # unit tests
pnpm test:watch     # unit tests in watch mode
pnpm test:cov       # unit tests with coverage
pnpm test:e2e       # HTTP-level tests
pnpm lint           # apply ESLint fixes
```

## Prisma workflow

```bash
pnpm exec prisma validate
pnpm exec prisma generate
pnpm exec prisma migrate dev
pnpm exec prisma migrate deploy
pnpm exec prisma db seed
```

Use `prisma migrate dev` locally. Use `prisma migrate deploy` during deployment. Commit migrations and `pnpm-lock.yaml`; never hand-edit the lockfile or generated Prisma Client files.

## Conventions

Read before contributing, whether human or agent:

- [`AGENTS.md`](AGENTS.md)
- [NestJS naming skill](.claude/skills/nestjs-naming/SKILL.md)

The rules that matter most:

- Put business features under `src/modules/<feature>`.
- Keep controllers thin and business rules in services.
- Reuse the shared `PrismaService`.
- Return plain resources without success envelopes.
- Use explicit safe Prisma selections for models with sensitive fields.
- Add a new migration instead of rewriting an applied migration.
- Use pnpm exclusively.
- Cover new observable contracts with focused tests.

## Add only when needed

Useful additions for many real projects:

- Role-based authorization
- Structured request logging
- Swagger or OpenAPI
- Docker and Docker Compose
- Password reset
- Refresh-token rotation

Skip until the product requires them:

- Social login
- Payments
- File uploads
- Queues
- Microservices
- Complex permission systems

## License

[MIT](LICENSE)
