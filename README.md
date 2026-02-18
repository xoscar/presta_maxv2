# PrestaMax - Loan Management System

A modern loan management system built with Next.js 14, TypeScript, and MongoDB.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: MongoDB with Prisma ORM
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: TanStack Query (React Query)
- **Authentication**: JWT with jose
- **Testing**: Jest + React Testing Library (unit), Playwright (E2E)

## Prerequisites

- Node.js 18 or higher
- Docker (for local MongoDB) or a MongoDB instance

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Start MongoDB with Docker

```bash
docker-compose up -d
```

This starts a MongoDB replica set on `localhost:27017`.

### 3. Configure environment variables

Copy the example environment file and update with your values:

```bash
cp .env.local.example .env.local
```

Required environment variables:

```env
DATABASE_URL="mongodb://localhost:27017/prestamax?replicaSet=rs0&directConnection=true"
JWT_SECRET=your-super-secret-jwt-key-change-in-production
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Generate Prisma client

```bash
npx prisma generate
```

### 5. Seed the database

```bash
npm run db:seed
```

This creates:
- An admin user (`admin` / `admin123`)
- Sample clients with realistic Mexican data
- Sample loans with payment history
- Sample charges

Use `npm run db:seed:reset` to clear and reseed the database.

### 6. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and login with `admin` / `admin123`.

## Project Structure

```
presta_maxv2/
├── app/                      # Next.js App Router
│   ├── (dashboard)/          # Protected dashboard routes
│   │   ├── clients/          # Client pages
│   │   │   └── [id]/         # Client profile
│   │   └── loans/            # Loan pages
│   │       └── [id]/         # Loan profile
│   ├── api/                  # API Route Handlers
│   │   ├── clients/          # Client endpoints
│   │   ├── loans/            # Loan endpoints
│   │   ├── charges/          # Charge endpoints
│   │   └── users/            # Auth endpoints
│   ├── login/                # Login page
│   ├── globals.css           # Global styles + shadcn variables
│   └── layout.tsx            # Root layout with providers
├── components/               # React components
│   ├── ui/                   # shadcn/ui + custom components
│   │   ├── button.tsx        # Button component
│   │   ├── card.tsx          # Card component
│   │   ├── dialog.tsx        # Dialog/Modal component
│   │   ├── FormInput.tsx     # Form input with label
│   │   ├── Pagination.tsx    # Pagination controls
│   │   └── ...               # Other UI components
│   ├── clients/              # Client-specific components
│   │   ├── ClientsPageContent.tsx
│   │   └── ClientProfileContent.tsx
│   └── loans/                # Loan-specific components
│       ├── LoansPageContent.tsx
│       └── LoanProfileContent.tsx
├── lib/                      # Utilities and business logic
│   ├── api.ts                # Typed API client with error handling
│   ├── auth.ts               # JWT authentication helpers
│   ├── prisma.ts             # Prisma client singleton
│   ├── problem-details.ts    # RFC 7807 error responses
│   ├── query-client.tsx      # React Query provider
│   ├── utils.ts              # Utility functions (cn, etc.)
│   ├── hooks/                # React Query hooks
│   │   ├── useClients.ts     # Client data hooks
│   │   ├── useLoans.ts       # Loan data hooks
│   │   ├── useCharges.ts     # Charge data hooks
│   │   └── useAuth.ts        # Auth hooks
│   └── services/             # Business logic services
│       ├── user.service.ts
│       ├── client.service.ts
│       ├── loan.service.ts
│       ├── charge.service.ts
│       └── payment.service.ts
├── prisma/                   # Database
│   ├── schema.prisma         # Prisma schema
│   └── seed/                 # Database seeding
│       ├── index.ts          # Seed script
│       └── generators.ts     # Random data generators
├── e2e/                      # Playwright E2E tests
│   ├── fixtures.ts           # Test utilities & selectors
│   ├── auth.setup.ts         # Auth setup for tests
│   ├── auth.spec.ts          # Authentication tests
│   ├── clients.spec.ts       # Client management tests
│   ├── loans.spec.ts         # Loan management tests
│   └── charges.spec.ts       # Charge management tests
├── __tests__/                # Jest unit tests
├── types/                    # TypeScript type definitions
├── middleware.ts             # Next.js middleware (auth)
├── docker-compose.yaml       # MongoDB container config
├── playwright.config.ts      # Playwright configuration
└── package.json
```

## Available Scripts

### Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

### Database

- `npm run db:seed` - Seed the database with sample data
- `npm run db:seed:reset` - Clear and reseed the database
- `npx prisma generate` - Generate Prisma client
- `npx prisma studio` - Open Prisma Studio (database GUI)

### Testing

- `npm test` - Run Jest unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:e2e` - Run Playwright E2E tests
- `npm run test:e2e:ui` - Run E2E tests with UI
- `npm run test:e2e:headed` - Run E2E tests in headed mode

## API Endpoints

All API responses follow [RFC 7807 Problem Details](https://datatracker.ietf.org/doc/html/rfc7807) for errors.

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/users/login` | Login and get JWT token |
| POST | `/api/users/logout` | Logout and clear session |

### Clients

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/clients` | List clients (search, pagination) |
| POST | `/api/clients` | Create client |
| GET | `/api/clients/:id` | Get client with loans & charges |
| PATCH | `/api/clients/:id` | Update client |
| DELETE | `/api/clients/:id` | Delete client (cascades) |

### Loans

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/loans` | List loans (search, filter, pagination) |
| POST | `/api/loans` | Create loan |
| GET | `/api/loans/:id` | Get loan with payments |
| DELETE | `/api/loans/:id` | Delete loan |

### Payments

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/loans/:id/payments` | Add payment to loan |
| DELETE | `/api/loans/:id/payments/:paymentId` | Delete payment |

### Charges

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/charges` | Create charge for client |
| GET | `/api/charges/:id` | Get charge details |
| DELETE | `/api/charges/:id` | Delete charge |
| POST | `/api/charges/:id/pay` | Mark charge as paid |

## Features

### Client Management
- Create, edit, and delete clients
- View client profile with loans and charges
- Search clients by name or ID

### Loan Management
- Create loans with amount, weekly payment, and duration
- Track loan progress and remaining balance
- Add and remove payments
- Filter loans by status (active/finished)

### Charge Management
- Create charges for clients
- Mark charges as paid
- Delete charges

### Authentication
- JWT-based authentication
- Protected routes with middleware
- Session management with cookies

## Development Notes

### Adding shadcn/ui Components

```bash
npx shadcn@latest add <component-name>
```

### Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | MongoDB connection string |
| `JWT_SECRET` | Secret key for JWT signing |
| `NEXT_PUBLIC_APP_URL` | Public URL of the application |

## License

Private - All rights reserved
