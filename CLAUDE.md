# Frontend Project Rules

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
- **Framework**: Next.js (App Router)
- **UI Library**: shadcn/ui + Radix UI
- **Styling**: Tailwind CSS
- **Testing**: Jest + React Testing Library
- **Contract Testing**: Pact (Consumer)
- **Package Manager**: pnpm

## Clean Architecture

Same dependency rule as backend — inward-pointing. Use Cases are pure TypeScript with zero React imports.

```
┌──────────────────────────────────────────────────────────────────┐
│                      PRESENTATION                                 │
│  Pages (app/), Feature Components, Custom Hooks                  │
├──────────────────────────────────────────────────────────────────┤
│                      APPLICATION                                  │
│  Use Cases (pure TypeScript, no React)                           │
├──────────────────────────────────────────────────────────────────┤
│                      DOMAIN                                       │
│  Types, Interfaces (Ports), Mappers, Constants                   │
├──────────────────────────────────────────────────────────────────┤
│                      INFRASTRUCTURE                               │
│  Repositories (Adapters), Services (Http, Storage, Navigation)   │
└──────────────────────────────────────────────────────────────────┘
```

## Project Structure

```
src/
├── app/                           # Next.js App Router
│   ├── layout.tsx
│   └── <route>/page.tsx
├── features/                      # Feature modules (Bounded Contexts)
│   └── <feature>/
│       ├── application/usecases/  # Business logic (NO React imports)
│       ├── components/            # Feature-specific UI
│       ├── hooks/                 # Custom React hooks
│       ├── interfaces/            # Repository ports
│       ├── mappers/               # Domain → Presentation
│       ├── repositories/          # Repository adapters
│       └── types/                 # Domain types
└── shared/
    ├── components/
    │   ├── atoms/                 # Button, Input, Typography
    │   ├── molecules/             # SearchBar, IconButton, FormField
    │   ├── organisms/             # AuthForm, Navbar, DataTable
    │   ├── templates/             # DashboardLayout, AuthLayout
    │   └── shadcn/                # shadcn/ui components
    ├── interfaces/                # HttpClient, NavigationClient, etc.
    ├── providers/                 # React Context (Dependency Injection)
    ├── services/                  # Service adapters
    └── lib/utils.ts               # Tailwind cn() helper
```

## Layer Rules

- **Use Cases**: Pure TypeScript, NO React imports, constructor injection
- **Mappers**: Static methods, pure functions, domain → presentation
- **Hooks**: Coordinate use cases + React state, inject dependencies
- **Components**: Thin presentation, delegate logic to hooks

## Atomic Design (MANDATORY)

Every component MUST fit into the hierarchy before creation:

| Level | Description | Examples | Location |
|-------|-------------|----------|----------|
| **Atom** | Indivisible | Button, Input, Typography | `shared/components/atoms/` |
| **Molecule** | 2-3 atoms | SearchBar, FormField | `shared/components/molecules/` |
| **Organism** | Complex sections | Navbar, AuthForm | `shared/components/organisms/` |
| **Template** | Page layouts | DashboardLayout | `shared/components/templates/` |
| **Feature** | Domain-specific | ProjectList, KudosCard | `features/<feature>/components/` |

Decision rule: atoms cannot import from molecules or above.

## Testing Strategy

| Layer | Tool | Scope |
|-------|------|-------|
| Sociable Unit | Jest + RTL `renderHook` | Use case + hook behavior, stubs for I/O |
| Narrow Integration | Jest + RTL `renderHook` | Hook + real Use Case, stubs for HTTP |
| Component | Jest + RTL | Component behavior from user perspective |
| Contract (Consumer) | Pact | Define API expectations, publish to broker |

## Rules

@~/.claude/stacks/frontend/atomic-design.md
@~/.claude/stacks/frontend/clean-architecture.md
@~/.claude/stacks/frontend/unit-testing.md
@~/.claude/stacks/frontend/component-testing.md
@~/.claude/stacks/frontend/narrow-integration-test.md
