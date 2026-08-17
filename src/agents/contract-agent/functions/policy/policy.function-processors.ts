import { Logger } from '@nestjs/common';
import { GptFunctionProcessor } from 'src/openai/type/gptFunctionProcessor.type';
import { SearchPoliciesArgs } from './type/searchPolicies.type';

const logger = new Logger('SearchPolicies');

export const searchPoliciesProcessor: GptFunctionProcessor = async (
  gptArgs: string,
  openSearchService,
) => {
  try {
    const args = JSON.parse(gptArgs) as SearchPoliciesArgs;

    const result = await openSearchService.retriveInformation('policies', {
      text: args.text,
    });

    const policies = result.body.hits.hits.map(
      (hit: { _source?: object; _score?: number }) => ({
        ...hit._source,
        score: hit._score,
      }),
    );

    return JSON.stringify(policies);
  } catch (error) {
    logger.error(
      'Error in searchPoliciesProcessor:',
      error instanceof Error ? error.stack : String(error),
    );
    return JSON.stringify({
      error: 'Failed to look the policies up in the knowledge base',
    });
  }
};