import { Logger } from '@nestjs/common';
import { GptFunctionProcessor } from 'src/openai/type/gptFunctionProcessor.type';
import { WebHookClient } from 'src/agents/webhook-client/webHook.client';
import { checkProperty } from 'src/shared/util/checkProperty.util';
import { ApprovedCardArgs } from '../type/approvedCard.type';
import { buildApprovedCardDescription } from '../trelloCard.util';


const logger = new Logger('CreateApprovedCard');

export const createApprovedCardProcessor: GptFunctionProcessor = async (
  gptArgs: string,
) => {
  try {
    const args = JSON.parse(gptArgs) as ApprovedCardArgs;

    const validate = checkProperty(args, [
      'title',
      'counterparty_name',
      'summary',
    ]);
    if (validate.erros.length) {
      return JSON.stringify(validate.erros);
    }

    const response = await WebHookClient.post('6ogdgd1mgf5t3teyi9fxbioep6i2sx08', {
      name: args.title,
      desc: buildApprovedCardDescription(args),
    });

    return JSON.stringify({
      ...response.data,
      list: 'Sent / Auto-Approved',
      title: args.title,
    });
  } catch (error) {
    logger.error(
      'Error in createApprovedCardProcessor:',
      error instanceof Error ? error.stack : String(error),
    );
    return JSON.stringify({
      error: 'Failed to create the Trello approved card',
    });
  }
};