---
name: nestjs-naming
description: Naming conventions for NestJS projects — controllers, services, DTOs, Prisma models, modules, guards, pipes, interceptors, decorators, and filenames. Use this skill whenever generating or editing NestJS/TypeScript backend code, including scaffolding modules, writing endpoints, or reviewing existing code. Also trigger when the user asks to "clean up names", "fix naming", or requests NestJS conventions. Apply these naming rules any time NestJS code is produced, even if naming isn't mentioned explicitly.
---

# NestJS Naming Conventions

Naming only. This skill does not dictate architecture, layering, or method signatures — only what things are called.

## Core Principle

**A name should say what it does, specifically enough to read on its own.**

```
BAD:  create(dto)          → create what?
GOOD: createTeam(body)     → self-documenting
```

Avoid the generic CLI scaffold names — `create`, `findAll`, `findOne`, `update`, `remove` — as the default. Reach for a verb that describes the actual operation.

---

## Controllers

- Class: `PluralEntity + Controller` — `TeamsController`, `InvoicesController`
- Methods: **verb + entity** — `createTeam`, `getTeam`, `getAllTeams`, `archiveTeam`
- `@Body()` params: name them `body`. The DTO type already describes the shape, so `createTeamDTO` just restates it.
- Path params: use the domain name — `id`, `slug`, `code`

```typescript
// ✅
@Post()
createTeam(@Body() body: CreateTeamDTO) { ... }

@Get()
getAllTeams() { ... }

@Delete(':id')
archiveTeam(@Param('id', ParseUUIDPipe) id: string) { ... }

// ❌
@Post()
create(@Body() createTeamDTO: CreateTeamDTO) { ... }

@Get()
findAll() { ... }

@Delete(':id')
remove(@Param('id') id: string) { ... }
```

---

## Services

- Class: `PluralEntity + Service` — `TeamsService`, `AuthService`
- Methods: a verb that names the operation — `archiveTeam`, `recalculateTotals`, `issueRefund`
- Include the entity when it disambiguates. Inside an already-scoped service it can be redundant (`TeamsService.archive()` reads fine); include it when the class handles several entities or when the bare verb is vague.
- Helpers: name the intent — `validateOwnership`, `buildTeamQuery`, `formatInvoiceLine`

---

## DTOs

- Class: `Verb + Entity + DTO` — `CreateTeamDTO`, `InviteMemberDTO`, `FilterInvoicesDTO`
- Properties: camelCase. Booleans read as predicates: `isActive`, `hasAccess`
- Name properties for what the API exposes, not for what the database column is called

```typescript
// ✅
export class CreateTeamDTO {
  name: string;
  isPublic: boolean;
}

// ❌ — generic class name
export class CreateDto { ... }
```

---

## Prisma Models

- Model: singular PascalCase — `Category`, `OrganizationMember`
- Fields: camelCase — `createdAt`, `isArchived`; booleans prefixed `is`/`has`
- Relations named for what they hold — `products`, `owner`, `members`
- If the schema maps to snake_case columns and plural tables, follow the existing project's convention consistently:

```prisma
model Category {
  id          String    @id @default(uuid())
  name        String    @unique
  isArchived  Boolean   @default(false) @map("is_archived")

  products    Product[]

  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")

  @@map("categories")
}
```

---

## Everything Else

| Type        | Pattern                 | Example                                     |
|-------------|-------------------------|---------------------------------------------|
| Module      | `PluralEntity + Module` | `TeamsModule`, `AuthModule`                 |
| Guard       | `Purpose + Guard`       | `RolesGuard`, `JwtAuthGuard`                |
| Pipe        | `Purpose + Pipe`        | `ParseUUIDPipe`, `TrimPipe`                 |
| Interceptor | `Purpose + Interceptor` | `LoggingInterceptor`                        |
| Filter      | `Purpose + Filter`      | `HttpExceptionFilter`                       |
| Middleware  | `Purpose + Middleware`  | `LoggerMiddleware`                          |
| Decorator   | `@NounOrVerb()`         | `@CurrentUser()`, `@OrgRoles()`, `@Public()` |

Decorators name what they give you, not how: `@CurrentUser()` not `@GetUserFromRequest()`.

---

## Filenames

kebab-case, suffixed with the construct: `teams.controller.ts`, `create-team.dto.ts`, `team-membership.guard.ts`, `team-with-members.interface.ts`.

---

## Verb Cheat Sheet

| Instead of | Reach for                                                      |
|------------|----------------------------------------------------------------|
| `findAll`  | `getAllTeams`, `getActiveUsers`, `listInvoices`, `searchOrders` |
| `findOne`  | `getTeam`, `getUserByEmail`                                     |
| `update`   | `renameTeam`, `reassignOwner`, `markAsComplete`                 |
| `remove`   | `archiveTeam`, `revokeToken`, `cancelInvite`                    |
| `delete`   | `softDeleteTeam`, `purgeExpiredTokens`                          |

---

## Checklist

1. No bare `create` / `findAll` / `findOne` / `update` / `remove` on controllers
2. `@Body()` params named `body`
3. Filenames kebab-case with the right suffix
4. Booleans read as predicates (`isArchived`, `hasAccess`)
5. Verbs match the real operation — `archive` when it's a soft delete
