import { Global, Module } from '@nestjs/common';
import { SimpleStorePrismaService } from './simple-store-prisma.service';

@Global()
@Module({
  providers: [SimpleStorePrismaService],
  exports: [SimpleStorePrismaService],
})
export class SimpleStorePrismaModule {}
