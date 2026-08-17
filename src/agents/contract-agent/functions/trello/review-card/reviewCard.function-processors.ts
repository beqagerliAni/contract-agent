import { Logger } from '@nestjs/common';
import { GptFunctionProcessor } from 'src/openai/type/gptFunctionProcessor.type';
import { WebHookClient } from 'src/agents/webhook-client/webHook.client';
import { checkProperty } from 'src/shared/util/checkProperty.util';
import { ReviewCardArgs } from '../type/reviewCard.type';
import { buildReviewCardDescription } from '../trelloCard.util';


const logger = new Logger('CreateReviewCard');

export const createReviewCardProcessor: GptFunctionProcessor = async (
  gptArgs: string,
) => {
  try {
    const args = JSON.parse(gptArgs) as ReviewCardArgs;

    const validate = checkProperty(args, [
      'title',
      'counterparty_name',
      'summary',
      'reasons',
    ]);
    if (validate.erros.length) {
      return JSON.stringify(validate.erros);
    }

    const response = await WebHookClient.post('nwdr5bio34esn2bp1clt4bg3vdfbz383', {
      name: args.title,
      desc: buildReviewCardDescription(args),
    });

    return JSON.stringify({
      ...response.data,
      list: 'Needs Review',
      title: args.title,
    });
  } catch (error) {
    logger.error(
      'Error in createReviewCardProcessor:',
      error instanceof Error ? error.stack : String(error),
    );
    return JSON.stringify({
      error: 'Failed to create the Trello review card',
    });
  }
};
