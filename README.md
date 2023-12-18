# (Next.js + Tailwind + shadcn/ui + Prisma) Template

- [(Next.js + Tailwind + shadcn/ui + Prisma) Template](#nextjs--tailwind--shadcnui--prisma-template)
  - [Getting Started](#getting-started)
    - [Prisma Setup](#prisma-setup)


## Getting Started

Install dependencies with "pnpm"

```bash
pnpm install
```

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

### Prisma Setup

pnpm add -D prisma
pnpm add @prisma/client
<!-- npx prisma init -->
npx prisma db push
<!-- npx prisma generate -->
npx prisma studio
<!-- https://www.prisma.io/docs/orm/prisma-migrate/workflows/seeding -->
npx prisma db seed