import { Body, Controller, Post, Query } from '@nestjs/common';
import { OpenSearchService } from './opensearch.service';

@Controller('opensearch')
export class OpenSearchController {
  constructor(private readonly openSearchService: OpenSearchService) {}

  @Post('index')
  async createIndex(@Query('index') indexName?: string) {
    return await this.openSearchService.createIndex(indexName);
  }

  // the index name decides which schema the documents are validated against
  @Post('document')
  async createDocument(
    @Body() documents: object[],
    @Query('index') indexName?: string,
  ) {
    return await this.openSearchService.createDocument(indexName, documents);
  }
}
