import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OpenaiModule } from './openai/openai.module';
import { ConfigModule } from '@nestjs/config';
import { ContractAgentModule } from './contract/contract-agent.module';
import { OpenSearchModule } from './opensearch/opensearch.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    OpenaiModule,
    ContractAgentModule,
    OpenSearchModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
