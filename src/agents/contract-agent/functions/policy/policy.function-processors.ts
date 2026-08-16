import { GptFunctionProcessor } from 'src/openai/type/gptFunctionProcessor.type';
import { SearchPoliciesArgs } from './type/searchPolicies.type';

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
    console.error('Error in searchPoliciesProcessor:', error);
    return JSON.stringify({
      error: 'Failed to look the policies up in the knowledge base',
    });
  }
};