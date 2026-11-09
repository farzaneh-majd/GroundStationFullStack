# Ground Station Web App - integrated data architecture

## Goal

The UI remains a Next.js presentation layer. Database access, F Prime integration, packet decoding, and command transport belong to the sibling Python backend. The legacy Next.js routes remain only as a temporary compatibility path.

## Modes

- `graphql`: the target mode. The frontend calls FastAPI + Strawberry and receives live telemetry through `graphql-transport-ws` subscriptions.
- `legacy`: the old `/api/telemetry/*` and `/api/telecommands` routes backed by one InfluxDB instance.

Set the mode with `NEXT_PUBLIC_DATA_SOURCE`.

## Layering

`feature/component -> hook -> service contract -> graphql | legacy adapter`

Components must not call GraphQL, `/api/*`, or InfluxDB directly. New data access belongs in `src/services`, with operation documents under `src/graphql`.

## Implemented GraphQL contract

The operation documents match `../GS-backend/gs_backend/app/graphql.py`.

Queries:

- `satellites`
- `rawTelemetryPackets(filter, limit)`
- `telemetryCatalog(satelliteId)`
- `telemetryHistory(input)`
- `telemetrySummaries(...)`
- `commands(satelliteId, limit)`

Mutations:

- `createRawTelemetryPacket(input)` - engineering/development injection only
- `updateRawTelemetryPacket(recordId, input)` - engineering/development only
- `deleteRawTelemetryPacket(recordId)` - engineering/development only
- `sendCommand(input)` - simulated unless the backend command bridge is explicitly enabled

Subscriptions:

- `rawTelemetry(satelliteId, telemetryId)`
- `telemetryPoint(satelliteId, channelId, field)`

## Canonical telemetry domain

Raw packets and operator telemetry are separate domains. Raw packets remain available for engineering/debugging. Normal UI features use `TelemetryCatalog`, `TelemetryChannel`, `TelemetryPoint`, and `TelemetrySeries` from `src/types/telemetry-domain.ts`.

Hierarchy: `Satellite -> Subsystem -> TelemetryChannel -> Field -> TelemetryPoint`.

Both projects use `SAT-A` and `SAT-B`. The backend development catalog matches the frontend telemetry IDs 1-8. Before flight use, replace it with metadata derived from the authoritative F Prime topology dictionary.

## Database ownership

- InfluxDB A stores SAT-A time-series telemetry.
- InfluxDB B stores SAT-B time-series telemetry.
- PostgreSQL stores shared catalog data, packet metadata, commands, synchronization checkpoints, and selected one-minute summaries.

PostgreSQL is the central operational database, not a full replica of either time-series database.
