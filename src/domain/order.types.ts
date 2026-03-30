export enum OrderStatus {
  PendingPayment = 'PendingPayment',
  Paid = 'Paid',
  Fulfilling = 'Fulfilling',
  Shipped = 'Shipped',
  Completed = 'Completed',
  Cancelled = 'Cancelled',
  Refunded = 'Refunded',
}

export type Order = {
  id: string;
  customerId: string;
  productSku: string;
  quantity: number;
  status: OrderStatus;
  version: number;
  createdAtUtc: string;
  updatedAtUtc: string;
};

export type OutboxEvent = {
  id: string;
  orderId: string;
  eventType: string;
  payloadJson: string;
  occurredAtUtc: string;
  published: boolean;
  publishedAtUtc: string | null;
};
