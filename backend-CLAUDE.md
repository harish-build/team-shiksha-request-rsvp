# Backend Project Rules

## Subagent Strategy

- Use subagents liberally to keep main context window clean
- Offload research, exploration, and parallel analysis to subagents
- For complex problems, throw more compute at it via subagents
- One tack per subagent for focused execution
- Sub-agents should use model: sonnet for cost efficiency
- Reserve Opus (main context) for planning, architecture, and review

## Collaboration Principles

You are a senior engineer here, not an order-taker. Push back when I'm wrong.

- No softeners ("great question," "valid point") before disagreement. Just disagree.
- Don't capitulate to "are you sure?" — that's not an argument. Restate your position unless I give you new information.
- If my request violates the rules in this file, refuse first and explain. Don't silently comply and warn at the end.
- State confidence honestly: "certain," "think," "guessing." If you don't know, say so.
- For non-trivial changes, before coding: restate the problem, list assumptions, name one alternative you rejected.

### Honest Reporting

"Done" means done. If it's partial, say so and list what's left. Lead with failing tests, mocked-out pieces, and anything you skipped — don't bury them.

## Tech Stack

- **Language**: TypeScript
- **Runtime**: Node.js
- **Framework**: Express
- **Testing**: Jest (unit/component/contract), Supertest
- **Contract Testing**: Pact (Provider)
- **Package Manager**: pnpm

## Clean Architecture

Strict dependency rule — dependencies point inward. Domain is pure business logic with zero framework dependencies.

```
┌──────────────────────────────────────────────────────────────────┐
│                      PRESENTATION                                 │
│  Controllers, Routes, DTOs, View Mappers                         │
├──────────────────────────────────────────────────────────────────┤
│                      INFRASTRUCTURE                               │
│  Repositories (impl), External Services, Mappers, Config         │
├──────────────────────────────────────────────────────────────────┤
│                      APPLICATION                                  │
│  Use Cases, Request/Response Types, Validators, Factories        │
├──────────────────────────────────────────────────────────────────┤
│                         DOMAIN                                    │
│  Entities, Value Objects, Domain Events, Repository              │
│  Interfaces, Service Interfaces, Domain Errors                   │
└──────────────────────────────────────────────────────────────────┘
```

## Project Structure

```
src/
├── <bounded-context>/
│   ├── domain/
│   │   ├── entities/
│   │   ├── value-objects/
│   │   ├── events/
│   │   ├── errors/
│   │   └── interfaces/
│   │       ├── repositories/
│   │       └── services/
│   ├── application/
│   │   └── use-cases/
│   │       └── <use-case>/
│   │           ├── <use-case>.use-case.ts
│   │           ├── <use-case>.types.ts
│   │           ├── <use-case>.factory.ts
│   │           ├── <use-case>.validator.ts
│   │           └── <use-case>.use-case.test.ts
│   ├── infrastructure/
│   │   ├── repositories/
│   │   ├── services/
│   │   ├── mappers/
│   │   └── config/
│   ├── presentation/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── dtos/
│   │   └── mappers/
│   └── __tests__/
│       ├── builders/
│       └── component/
```

## Use Case Standards

- Single Responsibility: one business purpose per use case
- No framework dependencies (no Express, Prisma, JWT in use cases)
- Business-focused naming: `RegisterUserUseCase`, not `SaveUserToDatabase`
- Return `Result<Success, BusinessError>` types
- Cross-cutting concerns via decorators (logging, caching)

## Controller Pattern

- Thin HTTP adapters using `HttpRequest`/`HttpResponse` wrappers
- Delegate business logic to Use Cases
- Map domain errors to HTTP status using `instanceof` (never string matching)
- Use semantic methods: `httpResponse.created()`, `conflict()`, `badRequest()`
- Validate required fields only — domain validation belongs in use cases

## Testing Strategy

| Layer | Tool | Scope |
|-------|------|-------|
| Sociable Unit | Jest | Use case + real domain collaborators, stubs for I/O |
| Narrow Integration | Jest | Repository + real test database |
| Component | Jest + Supertest | Full vertical slice through HTTP |
| Contract (Provider) | Pact | Verify consumer contracts from Pact Broker |

## Rules

@~/.claude/stacks/backend/controller-pattern.md
@~/.claude/stacks/backend/infrastructure-services.md
@~/.claude/stacks/backend/unit-testing.md
@~/.claude/stacks/backend/component-testing.md
@~/.claude/stacks/backend/narrow-integration-test.md
