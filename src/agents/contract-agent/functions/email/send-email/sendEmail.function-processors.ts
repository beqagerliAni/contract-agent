import { Logger } from '@nestjs/common';
import { GptFunctionProcessor } from 'src/openai/type/gptFunctionProcessor.type';
import { WebHookClient } from 'src/agents/webhook-client/webHook.client';
import { checkProperty } from 'src/shared/util/checkProperty.util';
import { checkEmail } from 'src/shared/util/checkEmail.util';
import { SendGmailEmailArgs } from '../type/sendGmailEmail.type';
import { buildApprovalHtml } from '../emailTemplate.util';


const logger = new Logger('SendGmailEmail');

export const sendGmailEmailProcessor: GptFunctionProcessor = async (
  gptArgs: string,
) => {
  try {
    const args = JSON.parse(gptArgs) as SendGmailEmailArgs;

    const validate = checkProperty(args, [
      'to',
      'subject',
      'counterparty_name',
      'message',
      'threadId'
    ]);
    if (validate.erros.length) {
      return JSON.stringify(validate.erros);
    }

    // this one sends for real, so we never let a name through as the address
    const emailErrors = checkEmail(args.to);
    if (emailErrors.length) {
      return JSON.stringify(emailErrors);
    }

    const response = await WebHookClient.post('q01ry8lp77xdvy2p452o1yhh7rc1wa22', {
      to: args.to,
      subject: args.subject,
      body: buildApprovalHtml(args),
      threadId: args.threadId,
    });

    return JSON.stringify({
      ...response.data,
      to: args.to,
      subject: args.subject,
      note: 'Sent immediately to the recipient. This cannot be recalled.',
    });
  } catch (error) {
    logger.error(
      'Error in sendGmailEmailProcessor:',
      error instanceof Error ? error.stack : String(error),
    );
    return JSON.stringify({
      error: 'Failed to send the email',
    });
  }
};