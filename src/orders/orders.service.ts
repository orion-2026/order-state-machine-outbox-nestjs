import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { writeFileSync, existsSync, readFileSync } from 'fs';
import { ChangeStatusDto } from './dto/change-status.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order, OrderStatus, OutboxEvent } from '../domain/order.types';
import { config } from '../config';

type Store = {
  orders: Order[];
  outbox: OutboxEvent[];
};

@Injectable()
export class OrdersService {
  private readonly transitions: Record<OrderStatus, Record<string, OrderStatus>> = {
    [OrderStatus.PendingPayment]: { pay: OrderStatus.Paid, cancel: OrderStatus.Cancelled },
    [OrderStatus.Paid]: { 'start-fulfillment': OrderStatus.Fulfilling, refund: OrderStatus.Refunded },
    [OrderStatus.Fulfilling]: { ship: OrderStatus.Shipped, cancel: OrderStatus.Cancelled },
    [OrderStatus.Shipped]: { complete: OrderStatus.Completed, refund: OrderStatus.Refunded },
    [OrderStatus.Completed]: {},
    [OrderStatus.Cancelled]: {},
    [OrderStatus.Refunded]: {},
  };

  private readonly dbFile = config.databaseConnectionString;

  private readStore(): Store {
    if (!existsSync(this.dbFile)) {
      const initial: Store = { orders: [], outbox: [] };
      writeFileSync(this.dbFile, JSON.stringify(initial, null, 2));
      return initial;
    }
    return JSON.parse(readFileSync(this.dbFile, 'utf8')) as Store;
  }

  private writeStore(store: Store) {
    writeFileSync(this.dbFile, JSON.stringify(store, null, 2));
  }

  listOrders(): Order[] {
    return this.readStore().orders.sort((a, b) => a.createdAtUtc.localeCompare(b.createdAtUtc));
  }

  getOrder(id: string): Order {
    const order = this.readStore().orders.find((item) => item.id === id);
    if (!order) throw new NotFoundException('Order not found.');
    return order;
  }

  createOrder(dto: CreateOrderDto): Order {
    const now = new Date().toISOString();
    const order: Order = {
      id: randomUUID(),
      customerId: dto.customerId,
      productSku: dto.productSku,
      quantity: dto.quantity,
      status: OrderStatus.PendingPayment,
      version: 1,
      createdAtUtc: now,
      updatedAtUtc: now,
    };

    const store = this.readStore();
    store.orders.push(order);
    store.outbox.push({
      id: randomUUID(),
      orderId: order.id,
      eventType: 'OrderCreated',
      payloadJson: JSON.stringify({
        id: order.id,
        customerId: order.customerId,
        productSku: order.productSku,
        quantity: order.quantity,
        status: order.status,
        version: order.version,
      }),
      occurredAtUtc: now,
      published: false,
      publishedAtUtc: null,
    });
    this.writeStore(store);
    return order;
  }

  allowedActions(id: string) {
    const order = this.getOrder(id);
    return { actions: Object.keys(this.transitions[order.status]).sort() };
  }

  transition(id: string, dto: ChangeStatusDto): Order {
    const action = dto.action.trim().toLowerCase();
    const store = this.readStore();
    const index = store.orders.findIndex((item) => item.id === id);
    if (index === -1) throw new NotFoundException('Order not found.');

    const current = store.orders[index];
    const nextStatus = this.transitions[current.status][action];
    if (!nextStatus) {
      throw new ConflictException(
        `Invalid transition from ${current.status} using action '${dto.action}'. Allowed actions: ${Object.keys(this.transitions[current.status]).join(', ')}`,
      );
    }

    const updated: Order = {
      ...current,
      status: nextStatus,
      version: current.version + 1,
      updatedAtUtc: new Date().toISOString(),
    };
    store.orders[index] = updated;
    store.outbox.push({
      id: randomUUID(),
      orderId: updated.id,
      eventType: 'OrderStatusChanged',
      payloadJson: JSON.stringify({
        id: updated.id,
        previousStatus: current.status,
        newStatus: updated.status,
        action,
        reason: dto.reason ?? null,
        version: updated.version,
      }),
      occurredAtUtc: updated.updatedAtUtc,
      published: false,
      publishedAtUtc: null,
    });
    this.writeStore(store);
    return updated;
  }

  listOutbox(): OutboxEvent[] {
    return this.readStore().outbox.sort((a, b) => a.occurredAtUtc.localeCompare(b.occurredAtUtc));
  }

  publishPendingOutbox() {
    const store = this.readStore();
    const now = new Date().toISOString();
    const events = store.outbox
      .filter((item) => !item.published)
      .sort((a, b) => a.occurredAtUtc.localeCompare(b.occurredAtUtc))
      .map((item) => ({ ...item, published: true, publishedAtUtc: now }));

    store.outbox = store.outbox.map((item) => {
      const changed = events.find((candidate) => candidate.id === item.id);
      return changed ?? item;
    });
    this.writeStore(store);
    return { publishedCount: events.length, events };
  }
}
