import { Module } from '@nestjs/common';
import { OpenSearchService } from './opensearch.service';
import { OpenSearchController } from './opensearch.controller';

@Module({
  providers: [OpenSearchService],
  controllers: [OpenSearchController],
  exports: [OpenSearchService],
})
export class OpenSearchModule {}
