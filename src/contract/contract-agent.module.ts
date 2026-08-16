import { Module } from '@nestjs/common';
import { ContractAgentService } from './contract-agent.service';
import { ContractAgentController } from './contract-agent.controller';
import { OpenaiModule } from 'src/openai/openai.module';
import { OpenSearchModule } from 'src/opensearch/opensearch.module';

@Module({
  imports: [OpenaiModule, OpenSearchModule],
  providers: [ContractAgentService],
  controllers: [ContractAgentController]
})
export class ContractAgentModule { }
