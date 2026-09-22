# next-auth

Nikboni is a small Next.js authentication project with a quiet black-and-white interface. It currently includes a responsive registration page, light and dark modes, client-side form validation, and a local registration API backed by a JSON file.

## Features

- Responsive Nikboni landing page and registration page
- Light and dark mode with the preference saved in `localStorage`
- Registration validation for name, email, password strength, and password confirmation
- Accessible inline form errors and loading/success states
- Duplicate email detection
- Password hashing with Node.js `scrypt` before local storage
- Local customer records stored outside the public web directory

## Routes

| Route                | Purpose                   |
| -------------------- | ------------------------- |
| `/`                  | Nikboni homepage          |
| `/register`          | Registration form         |
| `POST /api/register` | Creates a customer record |

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
	api/register/route.ts       Registration API and JSON persistence
	register/page.tsx            Registration UI and client validation
	globals.css                  Shared Nikboni theme and responsive styles
	layout.tsx                   Root layout and metadata
	page.tsx                     Homepage
.data/
	registration/customers.json  Local customer records
```

## Current Scope

The registration flow is ready for local development. Login, sessions, logout, email verification, and production database storage are not connected yet. For production use, replace the JSON file with a real database and add a dedicated session/authentication layer.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Node.js Crypto Documentation](https://nodejs.org/api/crypto.html)
