import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { OrdersController } from './orders/orders.controller';
import { OrdersService } from './orders/orders.service';

@Module({
  imports: [],
  controllers: [HealthController, OrdersController],
  providers: [OrdersService],
})
export class AppModule {}
