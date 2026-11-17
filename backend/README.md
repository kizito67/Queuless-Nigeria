# QueueLess API

The QueueLess backend powers appointment booking, live queue management, organization administration, and authenticated Socket.IO updates for the QueueLess Nigeria application.

## Stack

- Node.js and Express 5
- PostgreSQL with Prisma ORM
- JSON Web Tokens for authentication
- Socket.IO for live queue changes
- Helmet, CORS, Morgan, and rate limiting

## Prerequisites

- A current Node.js LTS installation
- PostgreSQL 15 or later

## Setup

1. Install dependencies.

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and set the required values.

   ```env
   DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/queueless_nigeria"
   JWT_SECRET="use-a-random-secret-of-at-least-32-characters"
   PORT=5001
   CLIENT_ORIGINS="http://localhost:5173"
   ```

   `DATABASE_URL` and `JWT_SECRET` are required. `PORT` defaults to `5000`; use `5001` when matching the frontend's local configuration. `CLIENT_ORIGINS` accepts a comma-separated list of allowed frontend origins. When it is unset, the API allows `http://localhost:5173` and `http://localhost:5174`.

3. Create/update the database schema and generate Prisma Client.

   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

4. Start the API.

   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:5001` when `PORT=5001` is set. Verify it with `GET /api/health`.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the API with Nodemon. |
| `npm start` | Start the API with Node.js. |
| `npm test` | Run the Node.js test suite. |

## API overview

All API endpoints are prefixed with `/api`. Protected endpoints expect:

```http
Authorization: Bearer <token>
```

| Area | Endpoints |
| --- | --- |
| Health | `GET /api/health` |
| Authentication | `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/change-password` |
| Organizations | `POST /api/organizations/register`, `GET /api/organizations`, `GET /api/organizations/board` |
| Appointments | `POST /api/appointments`, `GET /api/appointments/mine`, `GET /api/appointments/:id/status`, `PATCH /api/appointments/:id/cancel`, `POST /api/appointments/:id/checkin` |
| Staff queue | `GET /api/staff/queue`, `POST /api/staff/queue/call-next`, `POST /api/staff/queue/complete`, `PATCH /api/staff/queue/pause`, `PATCH /api/staff/appointments/:id/action` |
| Organization owner | `GET /api/business/overview`, staff and service management under `/api/business` |
| Admin | Organization review and status management under `/api/admin/organizations` |

Access is role-based: `customer`, `staff`, `owner`, and `admin`. Verified organizations are publicly discoverable; pending and suspended organizations are not.

## Live queue updates

Socket.IO connects on the same port as the HTTP API. Authenticate by supplying the JWT as the socket auth token:

```js
io(API_URL, { auth: { token } })
```

Customers can emit `queue:watch` with an appointment ID; staff and owners can emit `staff:watch`. The server broadcasts `queue:changed` when a queue changes.

## Project structure

```text
backend/
├── app.js                 # Express app and route registration
├── server.js              # HTTP server and Socket.IO startup
├── config/                # Environment, database, and CORS configuration
├── prisma/                # Prisma schema and migrations
├── src/
│   ├── controllers/       # Request handlers
│   ├── middleware/        # Authentication, authorization, limits, errors
│   ├── routes/            # Express route definitions
│   ├── sockets/           # Socket.IO setup and queue broadcasts
│   └── utils/             # Shared helpers
└── tests/                 # API tests
```

## Security notes

- Keep `.env` private; never commit database credentials or JWT secrets.
- Use a long, random `JWT_SECRET` (the server rejects values shorter than 32 characters).
- The API limits general traffic and uses stricter limits for login and registration endpoints.
- Set `NODE_ENV=production` and an explicit `CLIENT_ORIGINS` value before deploying.
