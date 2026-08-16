import { FunctionTool } from 'openai/resources/responses/responses';
import { FunctionName } from '../../../enum/FunctionNames.enum';

export const CreateReviewCard: FunctionTool = {
  type: 'function',
  strict: false,
  name: FunctionName.createReviewCard,
  description: `Adds a card to the "Needs Review" Trello list when a contract has been flagged and a Gmail draft has been created for it.

Use this tool immediately after create_gmail_draft succeeds, so the flagged contract is visibly tracked on the review board alongside its draft. Never call it before the draft exists, and never call it for a contract that was auto-approved.

The card should summarize the contract and list the specific reasons it was flagged, so a reviewer scanning the board understands what to check without opening anything else first. Give every reason you flagged it, not just the most serious one, and put the actual numbers in the detail — "auto-renews for 24 months, our limit is 12" tells a reviewer more than "renewal term too long".

You do not write the card layout. Provide the facts as separate fields and the system renders the card. Write every field in plain prose with no markdown and no HTML tags.`,
  parameters: {
    type: 'object',
    properties: {
      title: {
        type: 'string',
        description:
          'Card title: counterparty plus the short reason, for example "Northwind Logistics — auto-renewal exceeds policy".',
      },
      counterparty_name: {
        type: 'string',
        description:
          'The counterparty company name exactly as extracted from the contract.',
      },
      contract_reference: {
        type: 'string',
        description:
          'Optional. Contract number, title or filename, so the reviewer knows which document this is.',
      },
      summary: {
        type: 'string',
        description:
          'One line describing what the contract is: type of deal, value, and term.',
      },
      reasons: {
        type: 'array',
        description:
          'One entry per reason the contract was flagged. Include every reason, not only the most serious.',
        items: {
          type: 'object',
          properties: {
            reason: {
              type: 'string',
              description:
                'Short label for the problem, for example "Auto-renewal term" or "Unknown counterparty".',
            },
            detail: {
              type: 'string',
              description:
                'What was found and what was expected, with the actual values, for example "24 months, policy limit is 12 months".',
            },
          },
          required: ['reason', 'detail'],
          additionalProperties: false,
        },
      },
      draft_subject: {
        type: 'string',
        description:
          'Optional. The subject line of the Gmail draft you just created, so the reviewer can find it.',
      },
    },
    required: ['title', 'counterparty_name', 'summary', 'reasons'],
    additionalProperties: false,
  },
};
