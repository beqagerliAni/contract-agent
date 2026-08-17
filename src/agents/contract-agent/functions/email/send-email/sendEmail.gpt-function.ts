import { FunctionTool } from 'openai/resources/responses/responses';
import { FunctionName } from '../../../enum/FunctionNames.enum';

export const SendGmailEmail: FunctionTool = {
  type: 'function',
  strict: false,
  name: FunctionName.sendGmailEmail,
  description: `Sends an email directly via Gmail — immediately, no draft, no human review step. The message goes out the moment this tool is called and cannot be recalled.

Use this tool ONLY when a contract has been auto-approved: clean, compliant, high confidence, every check passed. Use it to send a short confirmation to the sender letting them know the contract has been processed and approved.

Never use this tool for a contract that has been flagged for review. If the contract needs review, use create_gmail_draft instead — never send directly in that case, under any circumstance.

Before calling this tool, confirm all of the following are true. If even one is not, use create_gmail_draft:
- The counterparty was found in the known clients knowledge base
- No policy violation was found for any extracted term
- Every required field was extracted clearly, with nothing missing or uncertain
- No lookup tool returned an error or an empty result you had to work around

You do not write the email layout. Provide the facts as separate fields and the system renders the email from them. Write every field in plain prose with no markdown and no HTML tags.`,
  parameters: {
    type: 'object',
    properties: {
      to: {
        type: 'string',
        description: `Recipient email address, normally the contract sender, for example "pieter.vandijk@solventbay.com".

Must be a full address containing "@" and a domain. A person's name or a company name is NOT a valid value — "Pieter van Dijk" and "Solvent Bay Manufacturing Co." are both wrong, "pieter.vandijk@solventbay.com" is right.

Take it from the sender of the message the contract came in with, or from a contact address written in the contract itself. This email is sent immediately and cannot be recalled, so never guess an address and never build one from the company name. If you cannot find a real address, do not call this tool — ask for it instead.`,
      },
      subject: {
        type: 'string',
        description:
          'Email subject line, for example "Northwind Logistics agreement — approved".',
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
      message: {
        type: 'string',
        description:
          'One short paragraph, plain prose, confirming what was approved and any detail the sender should know. No markdown, no HTML.',
      },
      threadId: {
        type: 'string',
        description:
          'Gmail thread ID to send the reply within an existing email thread, if applicable.',
      },
    },
    required: ['to', 'subject', 'counterparty_name', 'message','threadId'],
    additionalProperties: false,
  },
};