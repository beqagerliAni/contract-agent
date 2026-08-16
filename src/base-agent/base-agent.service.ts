import { Injectable } from '@nestjs/common';
import { agentsDefinitions } from 'src/agents/agentDefinitions';
import { OpenaiService } from 'src/openai/openai.service';
import { OpenSearchService } from 'src/opensearch/opensearch.service';
import { extractFileText } from 'src/shared/util/extractText.util';

@Injectable()
export abstract class BaseAgentService {
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
      console.log(fileInformation)
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
        onThreadRunCreated: function (): void {
          console.log('ThreadHasCreated');
        },
        onDelta: function (textDelta: string): void {
          messageChunk += textDelta;
        },
        onToolCall: function (info: {
          status: 'calling' | 'finished';
          name?: string;
        }): void {
          // we would have some logging or somekind of system that would tell
          // what kind of tools did agent use also if we had front we would just send some event
          console.log(
            'ToolCall Status: ',
            info.status,
            'ToolCall Info: ',
            info.name,
          );
        },
        onCompleted: function (): void {
          console.log('Agent finished response: ', messageChunk);
        },
        onError: function (e: unknown): void {
          console.log('Agent has faced Error: ', e);
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
