import { Logger } from '@nestjs/common';
import { GptFunctionProcessor } from 'src/openai/type/gptFunctionProcessor.type';
import { SearchKnownClientsArgs } from './type/searchKnownClients.type';
import { checkProperty } from 'src/shared/util/checkProperty.util';

const logger = new Logger('SearchKnownClients');

export const searchKnownClientsProcessor: GptFunctionProcessor = async (
  gptArgs: string,
  openSearchService,
) => {
  try {
    const args = JSON.parse(gptArgs) as SearchKnownClientsArgs;

    const validate = checkProperty(args, ['company_name']);
    if (validate.erros.length) {
      return JSON.stringify(validate.erros);
    }

    const { company_name, type } = args;

    const result = await openSearchService.retriveInformation('companies', {
      text: company_name,
      type,
    });

    const companies = result.body.hits.hits.map(
      (hit: { _source?: object; _score?: number }) => ({
        ...hit._source,
        score: hit._score,
      }),
    );

    return JSON.stringify(companies);
  } catch (error) {
    logger.error(
      'Error in searchKnownClientsProcessor:',
      error instanceof Error ? error.stack : String(error),
    );
    return JSON.stringify({
      error: 'Failed to look the company up in the knowledge base',
    });
  }
};