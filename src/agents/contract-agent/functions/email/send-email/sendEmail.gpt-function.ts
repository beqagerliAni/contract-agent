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
        description: 'Recipient email address, normally the contract sender.',
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
          'Optional. Gmail thread ID to send the reply within an existing email thread, if applicable.',
      },
    },
    required: ['to', 'subject', 'counterparty_name', 'message'],
    additionalProperties: false,
  },
};