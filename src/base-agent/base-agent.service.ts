import { Injectable, Logger } from '@nestjs/common';
import { agentsDefinitions } from 'src/agents/agentDefinitions';
import { OpenaiService } from 'src/openai/openai.service';
import { OpenSearchService } from 'src/opensearch/opensearch.service';
import { extractFileText } from 'src/shared/util/extractText.util';

@Injectable()
export abstract class BaseAgentService {
  private readonly logger = new Logger(BaseAgentService.name);

  constructor(private openaiService: OpenaiService, private opensearchService: OpenSearchService) { }

  async createThread(agentName: string) {
    const agentDef = this.getAgentDef(agentName);
    return await this.openaiService.createThread(agentDef);
  }

  async sendStreamMessage(
    message: string,
    threadId: string,
    agentName: string,
    file?: Express.Multer.File
  ): Promise<string> {
    let messageChunk = '';
    let fileInformation: undefined | string = undefined
    if (typeof file !== 'undefined') {
      fileInformation = await extractFileText(file.buffer)
    }
    const agentDef = this.getAgentDef(agentName);
    await this.openaiService.responseStreamMessage(
      message,
      agentDef,
      threadId,
      async (name: string, args: string) => {
        return agentDef.functions[name].processor(args, this.opensearchService);
      },
      {
        onThreadRunCreated: (): void => {
          this.logger.debug(`Thread run created for thread ${threadId}`);
        },
        onDelta: (textDelta: string): void => {
          messageChunk += textDelta;
        },
        onToolCall: (info: {
          status: 'calling' | 'finished';
          name?: string;
        }): void => {
          this.logger.log(`Tool ${info.name} ${info.status}`);
        },
        onCompleted: (): void => {
          this.logger.debug(`Agent finished response: ${messageChunk}`);
        },
        onError: (e: unknown): void => {
          this.logger.error(
            'Agent stream failed',
            e instanceof Error ? e.stack : String(e),
          );
        },
      },
      fileInformation
    );
    return messageChunk;
  }
  getAgentDef(agentName: string) {
    const agentDef = agentsDefinitions[agentName];
    if (typeof agentDef === 'undefined') {
      throw new Error('Agent name not found');
    }
    return agentDef;
  }
}
