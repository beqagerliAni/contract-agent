import { OpenSearchService } from "src/opensearch/opensearch.service";

export type GptFunctionProcessor = (
  args: any,
  openSearchService: OpenSearchService
) => Promise<string>;
