import { Injectable } from '@nestjs/common';
import { BaseAgentService } from 'src/base-agent/base-agent.service';

@Injectable()
export class ContractAgentService extends BaseAgentService {}
