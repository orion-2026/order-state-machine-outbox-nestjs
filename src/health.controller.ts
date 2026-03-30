import { Controller, Get } from '@nestjs/common';

@Controller()
export class HealthController {
  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      service: 'Order State Machine + Outbox Demo (NestJS)',
      pattern: 'State machine + service + outbox',
    };
  }
}
