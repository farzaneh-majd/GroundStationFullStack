# Twin CubeSat Ground Station workspace

This workspace contains two aligned projects:

- `ground station/`: Next.js operator interface.
- `GS-backend/gs_backend/`: FastAPI + Strawberry GraphQL backend, PostgreSQL master database, and one InfluxDB instance per satellite.

## Data flow

`F Prime GDS adapter -> authenticated backend ingest -> SAT-A/SAT-B InfluxDB -> GraphQL query/subscription -> Next.js`

PostgreSQL stores the shared satellite catalog, raw-packet metadata, commands, synchronization checkpoints, and selected one-minute telemetry summaries. It is the central operational database, not a byte-for-byte replica of either InfluxDB.

## Start the backend and databases

1. In `GS-backend/gs_backend`, copy `.env.example` to `.env`.
2. Replace every placeholder password, token, and API key. Keep the two InfluxDB tokens different.
3. Run `docker compose config` and then `docker compose up --build -d`.
4. Check `http://localhost:8000/health/ready` and `http://localhost:8000/graphql`.

The Compose API startup applies the existing Alembic migration. No migration file was created or edited during frontend/backend alignment.

## Start the frontend

In `ground station`, create or update `.env.local`:

```env
NEXT_PUBLIC_DATA_SOURCE=graphql
NEXT_PUBLIC_GRAPHQL_HTTP_URL=http://localhost:8000/graphql
NEXT_PUBLIC_GRAPHQL_WS_URL=ws://localhost:8000/graphql
```

Then run `npm install` and `npm run dev`. The active-satellite selector routes raw telemetry and commands to `SAT-A` or `SAT-B`.

## F Prime boundary

The included catalog is a development catalog aligned with the web app. Before live operation, an F Prime GDS adapter must validate frame/packet integrity and forward field payloads to `/ingest/packet`; the development catalog must be replaced by the generated mission topology dictionary. Command transmission remains simulated unless the explicitly configured GDS command bridge is enabled.
