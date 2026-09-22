# next-auth

Nikboni is a small Next.js authentication project with a quiet black-and-white interface. It includes registration, Auth.js credential authentication, protected dashboard access, light and dark modes, client-side form validation, and local customer records backed by a JSON file.

## Features

- Responsive Nikboni landing page and registration page
- Light and dark mode with the preference saved in `localStorage`
- Registration validation for name, email, password strength, and password confirmation
- Accessible inline form errors and loading/success states
- Duplicate email detection
- Password hashing with Node.js `scrypt` before local storage
- Auth.js credential provider with encrypted JWT sessions
- Protected dashboard with Auth.js server-side session checks
- Auth.js sign-in and sign-out flows
- Local customer records stored outside the public web directory

## Routes

| Route                     | Purpose                   |
| ------------------------- | ------------------------- |
| `/`                       | Nikboni homepage          |
| `/register`               | Registration form         |
| `/login`                  | Auth.js login form        |
| `/dashboard`              | Protected customer area   |
| `POST /api/register`      | Creates a customer record |
| `/api/auth/[...nextauth]` | Auth.js session endpoints |

## Requirements

- Node.js 20.9 or newer
- npm

## Getting Started

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The registration page is available at [http://localhost:3000/register](http://localhost:3000/register).

Auth.js requires `AUTH_SECRET`. A local secret is provided in `.env.local`; use a new strong secret for every deployed environment.

## Available Commands

```bash
npm run dev       # Start the development server
npm run lint      # Run ESLint
npm run build     # Create a production build
npm run start     # Start the production server
```

## Local Registration Storage

For local development, registration records are saved in:

```text
.data/registration/customers.json
```

Each record contains this shape:

```json
{
  "id": "generated-id",
  "name": "Customer name",
  "email": "customer@example.com",
  "passwordHash": "salt:derived-key",
  "createdAt": "2026-09-22T00:00:00.000Z"
}
```

The `.data` directory is ignored by Git because it may contain customer information. Do not commit real customer data or expose this directory through a public route.

## Project Structure

```text
app/
	api/auth/[...nextauth]/     Auth.js route handlers
	api/register/route.ts       Registration API and JSON persistence
	dashboard/page.tsx          Protected dashboard
	login/page.tsx              Auth.js login UI
	register/page.tsx            Registration UI and client validation
	globals.css                  Shared Nikboni theme and responsive styles
	layout.tsx                   Root layout and metadata
	page.tsx                     Homepage
auth.ts                         Auth.js credentials provider and callbacks
.data/
	registration/customers.json  Local customer records
```

## Current Scope

Registration and credential login are connected through Auth.js. Customer records are still stored in a local JSON file for development. Before production, replace that file with a database, configure a deployment-specific `AUTH_SECRET`, and add email verification, password reset, rate limiting, and account recovery.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Node.js Crypto Documentation](https://nodejs.org/api/crypto.html)
