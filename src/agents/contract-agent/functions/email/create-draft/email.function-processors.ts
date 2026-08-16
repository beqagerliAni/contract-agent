import { GptFunctionProcessor } from 'src/openai/type/gptFunctionProcessor.type';
import { WebHookClient } from 'src/agents/webhookClient/webHook.client';
import { checkProperty } from 'src/shared/util/checkProperty.util';
import { CreateGmailDraftArgs } from '../type/createGmailDraft.type';
import { buildDraftHtml } from '../emailTemplate.util';

export const createGmailDraftProcessor: GptFunctionProcessor = async (
  gptArgs: string,
) => {
  try {
    const args = JSON.parse(gptArgs) as CreateGmailDraftArgs;

    const validate = checkProperty(args, [
      'to',
      'subject',
      'counterparty_name',
      'summary',
      'requested_action',
    ]);
    if (validate.erros.length) {
      return JSON.stringify(validate.erros);
    }

    const response = await WebHookClient.post(
      '19lwvats4e4w6mv2t6uhociv07avwkc4',
      {
        to: args.to,
        subject: args.subject,
        body: buildDraftHtml(args),
        threadId: args.threadId,
      },
    );

    return JSON.stringify({
      ...response.data,
      to: args.to,
      subject: args.subject,
      note: 'Saved to the Gmail Drafts folder. Nothing was sent, a human still has to review and send it.',
    });
  } catch (error) {
    console.error('Error in createGmailDraftProcessor:', error);
    return JSON.stringify({
      error: 'Failed to create the gmail draft',
    });
  }
};
