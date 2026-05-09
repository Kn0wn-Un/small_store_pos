# Feature Architecture

Each feature follows:

```txt
feature-name/
├── actions/        # Server actions (input/output boundary)
├── components/     # Feature UI pieces
├── hooks/          # Feature-local client hooks
├── repositories/   # Data access only (Drizzle/Supabase queries)
├── services/       # Business workflows and orchestration
├── schemas/        # Zod validation and contracts
├── types/          # Feature-local TypeScript types
├── utils/          # Pure helper logic
```

Business rule:
- `actions` call `services`
- `services` call `repositories`
- `repositories` perform DB work only
