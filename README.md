# Order State Machine + Outbox Demo (NestJS)

A NestJS implementation of the order status flow architecture lesson.

## What this demo shows
- Order service as source of truth
- Explicit state machine for allowed transitions
- Service layer centralizing business rules
- Outbox pattern for domain event recording
- Very easy local run using a simple file-backed JSON store
- Docker support for quick demo startup

## Endpoints
- `GET /health`
- `POST /api/orders`
- `GET /api/orders`
- `GET /api/orders/{id}`
- `GET /api/orders/{id}/actions`
- `POST /api/orders/{id}/transitions`
- `GET /api/outbox`
- `POST /api/outbox/publish`

## Run locally
```bash
cp .env.example .env 2>/dev/null || true
npm install
npm run start
```

Default local store:
- `order-demo.db`

Note:
- This NestJS version keeps persistence intentionally simple with a file-backed JSON store so the project stays small and easy to understand.

## Run with Docker
```bash
docker compose up --build
```

## Good next upgrades
- Replace file store with PostgreSQL + Prisma or TypeORM
- Add background outbox publisher
- Add request validation decorators
- Add integration tests
- Add OpenAPI / Swagger
