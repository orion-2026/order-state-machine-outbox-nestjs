import { BadRequestException, Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ChangeStatusDto } from './dto/change-status.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersService } from './orders.service';

@Controller('api')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get('orders')
  listOrders() {
    return this.ordersService.listOrders();
  }

  @Get('orders/:id')
  getOrder(@Param('id') id: string) {
    return this.ordersService.getOrder(id);
  }

  @Post('orders')
  createOrder(@Body() dto: CreateOrderDto) {
    if (!dto.customerId?.trim() || !dto.productSku?.trim() || !dto.quantity || dto.quantity <= 0) {
      throw new BadRequestException('CustomerId, ProductSku, and positive Quantity are required.');
    }
    return this.ordersService.createOrder(dto);
  }

  @Get('orders/:id/actions')
  allowedActions(@Param('id') id: string) {
    return this.ordersService.allowedActions(id);
  }

  @Post('orders/:id/transitions')
  transition(@Param('id') id: string, @Body() dto: ChangeStatusDto) {
    if (!dto.action?.trim()) {
      throw new BadRequestException('Action is required.');
    }
    return this.ordersService.transition(id, dto);
  }

  @Get('outbox')
  listOutbox() {
    return this.ordersService.listOutbox();
  }

  @Post('outbox/publish')
  publishOutbox() {
    return this.ordersService.publishPendingOutbox();
  }
}
