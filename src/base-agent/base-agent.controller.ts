import { Body, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { BaseAgentService } from './base-agent.service';
import { FileInterceptor } from '@nestjs/platform-express';

export abstract class BaseAgentController {
  constructor(private baseAgentService: BaseAgentService) { }

  @Post('createThread')
  async createThread(@Body() data: {
    name: string
  }) {
    return await this.baseAgentService.createThread(data.name);
  }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  sendStreamMessage(
    @Body() data: {
      message: string,
      threadId: string,
      agentName?: string
    },
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<boolean> {
    return this.baseAgentService.sendStreamMessage(data.message, data.threadId, data.agentName || "ContractAgent", file);
  }
}
