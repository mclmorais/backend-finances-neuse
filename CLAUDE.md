# Bash commands
- pnpm build: Build the project
- pnpm lint: Lint the project
- pnpm lint --fix: Lint and fix auto-fixable problems

# Validation
- Build (pnpm build) and lint (pnpm lint) the project to validate if the implementation was successful.
- Prefer to use the linter's auto fix instead of fixing auto-fixable linter problems manually.

# Typescript
- Do not use explicit any.
- Type errors should be explicitly fixed, instead of using any or ts-ignore.