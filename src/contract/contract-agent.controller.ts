import { Controller } from '@nestjs/common';
import { BaseAgentController } from 'src/base-agent/base-agent.controller';
import { ContractAgentService } from './contract-agent.service';

@Controller('contract-agent')
export class ContractAgentController extends BaseAgentController {
  constructor(contractAgentService: ContractAgentService) {
    super(contractAgentService);
  }
}
