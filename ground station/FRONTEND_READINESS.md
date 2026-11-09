# Frontend/backend integration status

## Aligned now

- The UI is isolated behind telemetry and command services.
- The frontend and backend use `SAT-A` and `SAT-B` consistently.
- The active-satellite selector filters raw telemetry and command operations.
- GraphQL query, mutation, and subscription documents match the Strawberry schema.
- The development telemetry catalog matches frontend telemetry IDs 1-8 and packet layouts.
- Raw packet timestamps are accepted by both legacy and GraphQL paths.
- Live telemetry uses subscriptions in GraphQL mode; historical samples use InfluxDB-backed queries.
- PostgreSQL summary records are exposed through `telemetrySummaries`.
- Legacy mode remains available for the old single-Influx Next.js API routes.

## Requires local configuration

- Create backend `.env` from `.env.example` and replace every placeholder secret.
- Start PostgreSQL, both InfluxDB instances, the API, and the synchronization worker with Docker Compose.
- Set `NEXT_PUBLIC_DATA_SOURCE=graphql` in frontend `.env.local` and restart Next.js.

## Mission-specific work still required

- Import the authoritative F Prime topology dictionary in place of the development catalog.
- Implement and validate the GDS telemetry adapter, frame/CRC checks, and real command bridge.
- Add operator authentication, authorization, command approval/interlocks, and audit events before connecting a transmitter.
- Configure mission limits, retention, backups, alert persistence, and a durable multi-process event bus.
- Implement OTA signing/upload/verification only after mission security requirements are defined.
