# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

PrestaMax is a loan management application for managing clients, loans, payments, and charges. It uses a monorepo structure with a Node.js/Express API backend and a React frontend.

## Tech Stack

- **Backend**: Express.js 4.x, MongoDB with Mongoose 4.x
- **Frontend**: React 15.x, React Router 3.x, Materialize CSS, Webpack 3.x
- **Process Manager**: PM2
- **Testing**: Mocha, Chai, Supertest
- **Linting**: ESLint with Airbnb base config + security plugin
- **Node Version**: 6.1.0 (legacy - check package.json engines)

## Commands

### Development with Docker

```bash
docker-compose build
docker-compose up
```

### Manual Development

```bash
# Install dependencies in both api/ and webapp/ directories first
npm install  # in root, api/, and webapp/
npm start    # from root - starts both services with PM2
```

### API Testing

```bash
cd api && npm test  # Mocha tests with 5000ms timeout
```

### Frontend Build

```bash
cd webapp
npm run build       # Development build
npm run build:prod  # Production build
npm run lint        # ESLint
```

### Database

MongoDB backup/restore data available in `tools/backup/`. Use `mongorestore` after starting the MongoDB container.

## Environment Setup

Copy `.env.template` to `.env` and configure:

- `SESSION_SECRET` - JWT session secret
- `API_PORT` - API server port (default in docker: 4000)
- `APP_PORT` - Webapp server port (default in docker: 3000)
- `API_URL` - API URL for frontend to connect
- `MONGOLAB_URI` or `MONGODB_PORT_27017_TCP_ADDR` - MongoDB connection

## Architecture

### API (`api/`)

```
api/
├── api.js           # Entry point: Express setup, MongoDB connection, route mounting
├── controllers/     # Business logic for each domain
├── models/          # Mongoose models with validation methods (validateCreate, validateUpdate)
├── routes/          # Express route definitions (thin layer, delegates to controllers)
├── schemas/         # Mongoose schema definitions with field mappings
├── utils/           # Shared utilities
│   ├── auth.js      # JWT authentication middleware
│   ├── common.js    # Helper functions (search array generation, etc.)
│   └── errorHandler.js
└── test/            # Mocha/Supertest integration tests
```

**Key Pattern**: Models contain validation logic via static methods `validateCreate()` and `validateUpdate()`. Schemas define field mappings in `mappings` export for transforming request/response data.

### Webapp (`webapp/`)

```
webapp/
├── app.js           # Express server serving static files from /public
├── app/
│   ├── app.jsx      # React entry, React Router configuration
│   ├── components/  # React components organized by domain (clients, loans, payments, charges, users)
│   ├── models/      # Frontend data models
│   └── utils/
│       ├── auth.jsx # Token validation, authentication helpers
│       ├── rest.jsx # API client
│       └── errorHandling.jsx
├── public/          # Built static assets
└── webpack.config.js
```

**Key Pattern**: Route protection via `validateToken()` in React Router `onEnter` hooks. Components grouped by domain with `pages/` subdirectories for route-level components.

### API Endpoints

- `/clients` - Client management
- `/loans` - Loan management
- `/loans/:id/payments` - Payments (nested under loans)
- `/charges` - Charge management
- `/users` - User authentication

## Domain Concepts

- **Client**: Loan recipient with personal info
- **Loan**: Money lent to a client with weekly payments, tracks balance and expiration
- **Payment**: Individual payment toward a loan
- **Charge**: Additional fees/charges

## Code Conventions

- Spanish language used for validation messages and UI text (Mexican Spanish)
- Timezone: America/Mexico_City (configured in api.js)
- Date format: DD/MM/YYYY HH:mm
- Models use pre-save hooks for search indexing and computed fields
- `_id` access allowed (no-underscore-dangle disabled in ESLint)
