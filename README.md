# IP Location API

_A TypeScript REST API that resolves IPv4 addresses to geographic locations using an in‑memory CSV dataset lookup._

---

## Table of Contents
1. [Project Structure](#project-structure)
2. [Prerequisites](#prerequisites)
3. [Installation](#installation)
4. [Running the Server](#running-the-server)
5. [API Specification](#api-specification)
6. [Testing](#testing)
   - [Unit Tests](#unit-tests)
   - [Integration Tests](#integration-tests)
   - [Performance Tests](#performance-tests)
7. [Architecture & Design Decisions](#architecture--design-decisions)
8. [Error Handling & Status Codes](#error-handling--status-codes)
9. [Performance Characteristics](#performance-characteristics)

---

## Project Structure
```
├── data/
│   └── IP2LOCATION-LITE-DB11.CSV   # Original CSV
│
├── src/
│   ├── controllers/
│   │   └── ip-location-controller.ts  # HTTP handler for /ip/location
│   ├── services/
│   │   └── ip-location-service.ts     # loadDataset, findLocation
│   ├── utils/
│   │   └── ip-calculator.ts           # ipToId, isValidIp
│   ├── server.ts                      # createServer(), start(), stop()
│   └── index.ts                       # entry: loadDataset + start()
│
├── tests/
│   ├── fixtures/
│   │   └── ip-test.csv                # small fixture for fast tests
│   ├── unit/
│   │   ├── ip-calculator.test.ts      # unit tests for ipToId/isValidIp
│   │   └── ip-location-service.test.ts# unit tests for loadDataset/findLocation
│   ├── integration/
│   │   └── server.test.ts             # integration tests via Supertest + Jest
│   └── performance/
│       └── test.js                    # k6 performance tests
│
├── package.json
├── tsconfig.json
└── README.md  # you are here!
```

## Prerequisites
- **Node.js** v18 or higher (for global `fetch` support in integration tests)
- **npm** (or yarn) for package management
- **k6** CLI installed globally for performance tests (follow guide install [here](https://grafana.com/docs/k6/latest/set-up/install-k6/))

## Installation

1. Install dependencies:
   ```bash
   npm install
   ```
3. Place the dataset file `IP2LOCATION-LITE-DB11.CSV` into the `data/` folder.

## Running the Server

Compile & start:
```bash
npm run start
```
This does:
- Load `data/IP2LOCATION-LITE-DB11.CSV` into memory via streaming.
- Spin up an Express server on **http://localhost:3000**.

## API Specification

### GET `/ip/location`

**Query Parameter**:
- `ip` (string): IPv4 address to look up.

**Behavior**:
1. Validate format with `isValidIp` (regex + octet range).
2. Convert to numeric ID via `ipToId` bit-shift reduce.
3. Binary-search loaded ranges:
   ```ts
   lower_ip_id <= ip_id <= upper_ip_id
   ```
4. **200 OK** + payload if match:
   ```json
   { "country": "Country Name", "countryCode": "CC", "city": "City" }
   ```
5. **404 Not Found** if invalid format or no range found.

## Testing

### Unit Tests

Uses **Jest** for pure functions and service logic:
```bash
npm run test:unit
```  
_Covers_:
- `utils/ip-calculator.ts`  
- `services/ip-location-service.ts`  

### Integration Tests

Exercise the full HTTP pipeline with **Supertest** + Jest:
```bash
npm run test:integration
```  
_Covers_:
- `controllers/ip-location-controller.ts`  
- `server.ts` wiring  

### Performance Tests

Load tests via **k6** (script in `tests/performance/test.js`):
```bash
npm run test:performance
```  
_Scenarios_:
- 100 Virtual Users for 30s  
- Mixed valid/invalid IPs  
- Checks 200|404 and p(95)<100ms latency  

## Architecture & Design Decisions

- **Modular**: clear separation between HTTP layer, service logic, and utilities.
- **Streaming CSV**: avoids loading entire file as string, reduces GC pressure.
- **Binary Search**: O(log n) lookup, ~22 comparisons over 3M entries.
- **In-Memory Cache**: trades memory (~330MB) for sub-ms lookup.
- **Minimal Dependencies**: only Express + Jest + Supertest + k6; no CSV libs.

## Error Handling & Status Codes

| Case                           | Status | Response                          |
| ------------------------------ | ------ | --------------------------------- |
| Valid IP, found in dataset     | 200    | `{ country, countryCode, city }`  |
| Valid IP, not in any range or invalid/missing    | 404    | `{ error: 'Location not found' }` |

## Performance Characteristics

- **Lookup latency**: typically 1–5 ms (p(95)<100 ms)  
- **Concurrent users**: handles 100+ VUs in k6 without failures  
- **Memory footprint**: ~330 MB for full dataset load  
