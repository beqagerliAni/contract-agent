import { FunctionTool } from 'openai/resources/responses/responses';
import { FunctionName } from '../../../enum/FunctionNames.enum';

export const CreateGmailDraft: FunctionTool = {
  type: 'function',
  strict: false,
  name: FunctionName.createGmailDraft,
  description: `Creates a draft email in Gmail — it does NOT send anything. The draft is saved to the connected Gmail account's Drafts folder for a human to review, edit, and send manually.

Use this tool when a contract has been flagged for review and a follow-up email to the counterparty (or an internal reviewer) is needed.

Only call this when something is actually wrong with the contract. If every check passed — counterparty known, no term outside policy, all fields present, signed — this is the wrong tool: the contract is auto-approved and belongs to send_gmail_email. A contract where you can name no concrete problem has not been flagged.

Never use this tool to send an email directly — a human must always review and submit the draft themselves. Do not tell the user the email has been sent, only that a draft is waiting for them in Drafts.

You do not write the email layout. Provide the facts as separate fields and the system renders the formatted HTML email from them. Write every field in plain prose with no markdown and no HTML tags.

"to" must be a real email address, never a person's or company's name. The address is normally the sender of the message the contract arrived in. If no address appears anywhere in the conversation or the document, do not call this tool and do not invent one — say which address you are missing and ask for it.`,
  parameters: {
    type: 'object',
    properties: {
      to: {
        type: 'string',
        description: `Recipient email address, for example "marcus.feld@halberdlogistics.com".

Must be a full address containing "@" and a domain. A person's name or a company name is NOT a valid value — "Marcus Feld" and "Halberd Logistics Partners LLC" are both wrong, "marcus.feld@halberdlogistics.com" is right.

Take it from the sender of the message the contract came in with, or from a contact address written in the contract itself. Never guess an address, never build one from the company name, and never leave it as a name because you could not find the address — ask for it instead.`,
      },
      subject: {
        type: 'string',
        description:
          'Email subject line. Name the counterparty and the reason, for example "Northwind Logistics agreement — auto-renewal term exceeds policy".',
      },
      counterparty_name: {
        type: 'string',
        description:
          'The counterparty company name exactly as extracted from the contract.',
      },
      contract_reference: {
        type: 'string',
        description:
          'Optional. Contract number, title or filename, so the reader knows which document this is about.',
      },
      summary: {
        type: 'string',
        description:
          'One short paragraph, plain prose, explaining why the contract was flagged. No markdown, no HTML.',
      },
      issues: {
        type: 'array',
        description:
          'One entry per policy problem found. Leave empty only if the contract was flagged for a reason other than a policy breach, such as a missing field.',
        items: {
          type: 'object',
          properties: {
            term: {
              type: 'string',
              description:
                'The contract term at issue, for example "Auto-renewal term".',
            },
            found: {
              type: 'string',
              description:
                'The value actually found in the contract, for example "24 months".',
            },
            policy_limit: {
              type: 'string',
              description:
                'What policy allows, for example "12 months maximum".',
            },
            source: {
              type: 'string',
              description:
                'Optional. The policy name or contract clause this came from.',
            },
          },
          required: ['term', 'found', 'policy_limit'],
          additionalProperties: false,
        },
      },
      requested_action: {
        type: 'string',
        description:
          'One sentence stating exactly what the recipient needs to do or send back.',
      },
      deadline: {
        type: 'string',
        description:
          'Optional. When a reply is needed, for example "Friday 22 August".',
      },
      threadId: {
        type: 'string',
        description:
          'Optional. Gmail thread ID to attach the draft as a reply within an existing email thread, if applicable.',
      },
    },
    required: [
      'to',
      'subject',
      'counterparty_name',
      'summary',
      'requested_action',
    ],
    additionalProperties: false,
  },
};
