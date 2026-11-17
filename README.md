# QueueLess Nigeria

QueueLess is a queue-management and appointment-booking platform for banks, hospitals, government offices, and other service organizations in Nigeria. Customers reserve a place before leaving home, receive a digital queue number, and follow the queue live. Organizations manage services and staff, while staff run the queue from a dedicated console.

## What it does

- Lets customers discover verified organizations and their available services.
- Creates appointments with server-assigned queue numbers.
- Gives customers a private booking page, ticket history, and live queue view.
- Gives staff controls to call the next customer, complete service, pause the queue, and update appointment status.
- Gives organization owners an overview plus staff and service management tools.
- Gives administrators an organization-verification workflow.
- Broadcasts queue updates in real time with Socket.IO.

## Technology

| Area | Technology |
| --- | --- |
| Web app | React, Vite, React Router, Tailwind CSS |
| API | Node.js, Express 5 |
| Database | PostgreSQL with Prisma ORM |
| Authentication | JSON Web Tokens and bcrypt password hashing |
| Real-time | Socket.IO |
| API protection | Helmet, CORS, rate limiting, and role-based authorization |

## Project structure

```text
queueless_react/
|-- backend/                # Express API, Prisma schema, Socket.IO server, tests
|-- queueless-frontend/     # React and Vite web application
|-- README.md               # This guide
`-- LICENSE
```

For component-specific detail, see the [backend README](backend/README.md) and [frontend README](queueless-frontend/README.md).

## Prerequisites

- A current Node.js LTS installation
- PostgreSQL 15 or newer
- npm

## Run locally

### 1. Create a PostgreSQL database

Create a local database, for example `queueless_nigeria`.

### 2. Configure and start the backend

Open a terminal in `backend`.

```bash
cd backend
npm install
```

Copy `.env.example` to `.env`, then set its values:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/queueless_nigeria"
JWT_SECRET="use-a-random-secret-of-at-least-32-characters"
PORT=5001
CLIENT_ORIGINS="http://localhost:5173"
```

Apply the existing database migrations, generate Prisma Client, and start the development server:

```bash
npx prisma migrate dev
npx prisma generate
npm run dev
```

The API health endpoint is available at [http://localhost:5001/api/health](http://localhost:5001/api/health).

### 3. Configure and start the frontend

Open a second terminal in `queueless-frontend`.

```bash
cd queueless-frontend
npm install
```

Create `.env` in that folder:

```env
VITE_API_URL=http://localhost:5001
```

Then start Vite:

```bash
npm run dev
```

Open the URL Vite prints—normally [http://localhost:5173](http://localhost:5173).

## How to use QueueLess

### Customer

1. Register a customer account or log in.
2. Browse **Organizations** and select **Book** on a verified organization, or choose **Book appointment** in the navigation.
3. Choose an organization, service, date, and time.
4. Submit the booking to receive a ticket and live queue view.
5. Use **My tickets** to review, cancel, or follow existing bookings; check in when you arrive.

### Organization owner

1. Register the organization and its services from the business-registration flow.
2. An administrator verifies the organization.
3. Log in as the owner to access **Business**.
4. Add staff, reset staff passwords, and manage available services.

### Staff member

1. Log in with the credentials created by the organization owner.
2. Change the temporary password if prompted.
3. Open **Staff console** to call the next customer, mark a customer served, skip or recall appointments, and pause or resume the queue.

### Administrator

1. Log in with an admin account.
2. Open **Admin** to review organizations and update their status.

## Roles and access

| Role | Access |
| --- | --- |
| Visitor | Browse public organizations and the public queue board; register or log in. |
| Customer | Book appointments, check in, view/cancel tickets, and follow live queues. |
| Staff | Operate the queue for the assigned organization. |
| Owner | Manage the organization's staff, services, and overview. |
| Admin | Verify, suspend, or otherwise manage organizations. |

Protected routes require a valid JWT and the correct role. Organizations must be verified before appearing in public search and booking results.

## Real-time queue updates

The frontend establishes an authenticated Socket.IO connection for the staff console and live-ticket pages. Whenever appointments or queue state change, the backend sends a `queue:changed` event to the affected organization, allowing active clients to refresh without a page reload.

## Useful commands

Run these from the relevant project directory.

| Location | Command | Description |
| --- | --- | --- |
| `backend` | `npm run dev` | Run the API with Nodemon. |
| `backend` | `npm start` | Run the API with Node.js. |
| `backend` | `npm test` | Run API tests. |
| `queueless-frontend` | `npm run dev` | Run the Vite development server. |
| `queueless-frontend` | `npm run build` | Create a production build in `dist/`. |
| `queueless-frontend` | `npm run lint` | Run ESLint. |
| `queueless-frontend` | `npm run preview` | Preview the production build locally. |

## API overview

The backend is served below `/api`.

- `/api/health` — health check
- `/api/auth` — registration, login, profile, and password changes
- `/api/organizations` — organization registration, public directory, and public board
- `/api/appointments` — customer appointments and ticket actions
- `/api/staff` — staff queue controls
- `/api/business` — owner overview, staff, and services
- `/api/admin` — organization administration

See the [backend README](backend/README.md#api-overview) for endpoint-level details and authentication requirements.

## Testing and verification

Run the backend test suite with:

```bash
cd backend
npm test
```

Build the frontend before deployment:

```bash
cd queueless-frontend
npm run build
```

## Deploying

1. Deploy the PostgreSQL database and apply Prisma migrations.
2. Deploy the backend with `NODE_ENV=production`, a strong unique `JWT_SECRET`, its production `DATABASE_URL`, and an explicit `CLIENT_ORIGINS` list containing the frontend URL.
3. Set `VITE_API_URL` to the public HTTPS API URL and build the frontend.
4. Serve the generated frontend `dist/` directory from a static host.

Do not commit `.env` files, database credentials, or JWT secrets. Variables beginning with `VITE_` are bundled into the client application, so they must never contain secrets.

## License

See [LICENSE](LICENSE).
