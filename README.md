# 🚀 CubeSat Ground Station

A modern full-stack CubeSat Ground Station software built with **Next.js**, **InfluxDB**, and a **Grafana-inspired user interface**.

This project is designed as a scalable ground segment capable of receiving, decoding, storing, and visualizing CubeSat telemetry in real time.

---

# Features

* 📡 CubeSat telemetry visualization
* 📊 Professional Grafana-inspired dashboard
* 🛰️ Telemetry packet monitoring
* 🗄️ InfluxDB time-series database
* 🔌 RESTful API using Next.js
* 📈 Real-time charts and telemetry panels
* 🧪 Mock telemetry generator for development
* 📝 CRUD API for telemetry testing
* ⚡ Modern React / Next.js frontend

---

# Project Architecture

```
CubeSat
    │
    ▼
Ground Station Receiver
    │
    ▼
Packet Decoder
    │
    ▼
Next.js API
    │
    ▼
InfluxDB
    │
    ▼
Frontend Dashboard
```

---

# Technology Stack

## Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS
* Grafana UI Components
* Recharts

## Backend

* Next.js API Routes
* TypeScript

## Database

* InfluxDB 2.x
* Flux Query Language

## Development

* Docker
* Node.js
* Git

---

# Folder Structure

```
cubesat-groundstation/

├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── lib/
│   │   └── ...
│   ├── public/
│   └── package.json
│
├── scripts/
│   ├── seed-sensors.js
│   └── ...
│
├── docker-compose.yml
└── README.md
```

---

# Database Structure

Current bucket:

```
telemetry
```

Measurement:

```
tlm_samples
```

Example stored packet:

```
SYNC
LEN
PAYLOAD
CRC
```

Payload:

```
[tlmId][DATA]
```

Example:

```
SYNC        AA55
LEN         11
PAYLOAD     2000112233445566778899
CRC         1234
```

---

# API Endpoints

## Samples

| Method | Endpoint           | Description                |
| ------ | ------------------ | -------------------------- |
| GET    | `/api/samples`     | Retrieve telemetry samples |
| POST   | `/api/samples`     | Create telemetry sample    |
| PUT    | `/api/samples/:id` | Update telemetry sample    |
| DELETE | `/api/samples/:id` | Delete telemetry sample    |

---

# Dashboard

Current dashboard includes:

* Battery Voltage
* CPU Temperature
* Magnetometer
* LED Status
* Packet Table
* Telemetry Charts
* CRUD Test Panel

---

# Getting Started

## Clone the repository

```bash
git clone <repository-url>
```

```
cd cubesat-groundstation
```

---

## Start InfluxDB

```bash
docker compose up -d
```

---

## Install Frontend

```bash
cd frontend

npm install
```

---

## Configure Environment Variables

Create:

```
frontend/.env.local
```

Example:

```env
INFLUX_URL=http://localhost:8086
INFLUX_TOKEN=YOUR_TOKEN
INFLUX_ORG=cubesat
INFLUX_BUCKET=telemetry
```

---

## Seed Mock Telemetry

```bash
node scripts/seed-sensors.js
```

---

## Start Development Server

```bash
npm run dev
```

Open:

```
http://localhost:3000
```

---

# Development Workflow

```
Mock Telemetry
        │
        ▼
InfluxDB
        │
        ▼
Next.js API
        │
        ▼
Dashboard
```

---

# Future Roadmap

## Telemetry

* Real telemetry packets
* CRC validation
* Packet decoding
* Binary payload parser
* Telecommand support

## Dashboard

* Orbit visualization
* Ground track
* Satellite status
* Pass prediction
* Command uplink
* Alarm system
* Live telemetry streaming

## Backend

* Packet decoder service
* WebSocket telemetry
* Authentication
* Mission database
* Multi-satellite support

---

# Development Status

| Module                     | Status         |
| -------------------------- | -------------- |
| Frontend                   | 🟢 In Progress |
| Backend API                | 🟢 In Progress |
| Database                   | 🟢 Working     |
| Mock Telemetry             | 🟢 Working     |
| Dashboard                  | 🟢 In Progress |
| Packet Decoder             | 🟡 Planned     |
| Ground Station Integration | 🟡 Planned     |
| Satellite Integration      | 🔵 Future      |

---

# License

This project is intended for educational and research purposes in CubeSat ground segment development.
