import { FunctionTool } from 'openai/resources/responses/responses';
import { FunctionName } from '../../../enum/FunctionNames.enum';

export const CreateApprovedCard: FunctionTool = {
  type: 'function',
  strict: false,
  name: FunctionName.createApprovedCard,
  description: `Adds a card to the "Sent / Auto-Approved" Trello list when a contract has been auto-approved and the confirmation email has been sent directly.

Use this tool immediately after send_gmail_email succeeds, to keep a visible record of contracts that were processed and closed automatically with no human review required. Never call it before the email has been sent, and never call it for a contract that was flagged for review — that one belongs on the Needs Review list via create_review_card.

You do not write the card layout. Provide the facts as separate fields and the system renders the card. Write every field in plain prose with no markdown and no HTML tags.`,
  parameters: {
    type: 'object',
    properties: {
      title: {
        type: 'string',
        description:
          'Card title: counterparty plus the deal, for example "Acme Holdings — services agreement approved".',
      },
      counterparty_name: {
        type: 'string',
        description:
          'The counterparty company name exactly as extracted from the contract.',
      },
      contract_reference: {
        type: 'string',
        description:
          'Optional. Contract number, title or filename, so the record points at the right document.',
      },
      summary: {
        type: 'string',
        description:
          'One line describing what the contract is: type of deal, value, and term.',
      },
      checks_passed: {
        type: 'array',
        description:
          'What you verified before approving, one short line each, for example "Counterparty found in known clients" or "Auto-renewal 12 months, within the 12 month limit". This is the audit trail for a decision no human reviewed.',
        items: { type: 'string' },
      },
    },
    required: ['title', 'counterparty_name', 'summary'],
    additionalProperties: false,
  },
};
