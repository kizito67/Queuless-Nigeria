# QueueLess web app

The QueueLess frontend lets customers reserve appointments and follow live queues, while staff, organization owners, and admins manage their respective workflows.

## Stack

- React 19
- Vite 8
- React Router
- Tailwind CSS
- Socket.IO Client

## Prerequisites

- A current Node.js LTS installation
- A running [QueueLess API](../backend/README.md)

## Setup

1. Install dependencies.

   ```bash
   npm install
   ```

2. Create a `.env` file in this directory.

   ```env
   VITE_API_URL=http://localhost:5001
   ```

   This must match the URL and port of the backend. The backend must also allow this app's origin through `CLIENT_ORIGINS` (for local Vite development, normally `http://localhost:5173`).

3. Start the development server.

   ```bash
   npm run dev
   ```

Open the URL printed by Vite, usually `http://localhost:5173`.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Run the Vite development server with hot reload. |
| `npm run build` | Build optimized production assets into `dist/`. |
| `npm run preview` | Serve the production build locally. |
| `npm run lint` | Run ESLint. |

## User flows

| Role | Main pages |
| --- | --- |
| Visitor | Browse organizations, view the public board, then log in or sign up to book. |
| Customer | Book at `/book`, view tickets in `/dashboard`, and follow a ticket at `/queue/:id`. |
| Staff | Operate the assigned organization queue at `/staff`. |
| Owner | View organization metrics, manage staff, and manage services at `/business`. |
| Admin | Review and update organization status at `/admin`. |

Protected routes enforce both authentication and role access. A customer who starts from an organization card is taken to the dedicated booking page with that organization already selected.

## Real-time updates

The app sends the saved JWT to Socket.IO whenever a live queue page or the staff console opens. It listens for `queue:changed` events from the backend and reloads the affected queue.

## Project structure

```text
queueless-frontend/
├── public/                # Static files
├── src/
│   ├── components/        # Reusable UI and access-control components
│   ├── context/           # Authentication state
│   ├── pages/             # Routed application pages
│   ├── api.js             # HTTP client
│   ├── socket.js          # Socket.IO client helper
│   └── App.jsx            # Route definitions
├── vite.config.js
└── package.json
```

## Production configuration

Set `VITE_API_URL` to the public HTTPS URL of the API before building. Vite embeds variables beginning with `VITE_` into the client bundle, so do not put secrets in this file. Configure the backend's `CLIENT_ORIGINS` with the deployed frontend URL.
