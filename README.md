# Order State Machine + Outbox Demo (NestJS)

A NestJS implementation of the order status flow architecture lesson.

## What this demo shows
- Order service as source of truth
- Explicit state machine for allowed transitions
- Application/service layer centralizing business rules
- Outbox pattern for domain event recording
- Easy local run with a file-backed store
- Docker support for quick demo startup

## Order lifecycle
```text
PendingPayment -> Paid -> Fulfilling -> Shipped -> Completed
PendingPayment -> Cancelled
Paid -> Refunded
Fulfilling -> Cancelled
Shipped -> Refunded
```

## API surface
- `GET /health`
- `POST /api/orders`
- `GET /api/orders`
- `GET /api/orders/{id}`
- `GET /api/orders/{id}/actions`
- `POST /api/orders/{id}/transitions`
- `GET /api/outbox`
- `POST /api/outbox/publish`

## Environment variables
- `PORT=8080`
- `DATABASE_PROVIDER=sqlite`
- `DATABASE_CONNECTION_STRING=order-demo.db`

## Run locally
```bash
cp .env.example .env 2>/dev/null || true
npm install
npm run start
```

Default local store:
- `order-demo.db`

## Run with Docker
```bash
docker compose up --build
```

Default URL:
- API: `http://localhost:8080`

## Example flow
### Create order
```bash
curl -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -d '{"customerId":"cust-001","productSku":"sku-demo-001","quantity":2}'
```

### Check allowed actions
```bash
curl http://localhost:8080/api/orders/{orderId}/actions
```

### Transition state
```bash
curl -X POST http://localhost:8080/api/orders/{orderId}/transitions \
  -H "Content-Type: application/json" \
  -d '{"action":"pay","reason":"Payment callback received"}'
```

### Read outbox
```bash
curl http://localhost:8080/api/outbox
```

## Notes
- Uses a file-backed JSON store to keep the demo small and readable
- Keeps the same API shape as the .NET and Go versions
- Intentionally teaching-oriented, not production-complete

## Good next upgrades
- Replace file store with PostgreSQL + Prisma or TypeORM
- Add background outbox publisher
- Add request validation decorators
- Add integration tests
- Add OpenAPI / Swagger
