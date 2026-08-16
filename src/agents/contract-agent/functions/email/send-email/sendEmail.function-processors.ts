import { GptFunctionProcessor } from 'src/openai/type/gptFunctionProcessor.type';
import { WebHookClient } from 'src/agents/webhookClient/webHook.client';
import { checkProperty } from 'src/shared/util/checkProperty.util';
import { SendGmailEmailArgs } from '../type/sendGmailEmail.type';
import { buildApprovalHtml } from '../emailTemplate.util';


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
    ]);
    if (validate.erros.length) {
      return JSON.stringify(validate.erros);
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
    console.error('Error in sendGmailEmailProcessor:', error);
    return JSON.stringify({
      error: 'Failed to send the email',
    });
  }
};