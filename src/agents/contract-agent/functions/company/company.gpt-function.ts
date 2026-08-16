import { FunctionTool } from 'openai/resources/responses/responses';
import { FunctionName } from '../../enum/FunctionNames.enum';

export const SearchKnownClients: FunctionTool = {
  type: 'function',
  strict: false,
  name: FunctionName.searchKnownClients,
  description: `Retrieves information about a company (client or vendor) from the internal knowledge base to determine whether it is a known, existing business relationship or a new/unknown counterparty.
Use this tool whenever a contract has been extracted and you need to verify the counterparty before deciding whether the contract can be auto-approved or should be flagged for review.

The tool first attempts an exact name match against known company records. If no confident exact match is found, it falls back to a semantic (vector) search over company descriptions to catch name variations, minor extraction errors, or abbreviated names.
It returns whether the company is known, which record matched (if any), a similarity score, and any relevant notes about the relationship (status, risk level, history).

Call this tool once per extracted contract, using the counterparty name pulled out during extraction.
Treat match_type "semantic" as a likely but unconfirmed match and mention the uncertainty. If is_known is false, the counterparty is new and the contract should go to review.`,
  parameters: {
    type: 'object',
    properties: {
      company_name: {
        type: 'string',
        description:
          'The counterparty name exactly as it was extracted from the contract, for example "Acme Holdings Ltd".',
      },
      type: {
        type: 'string',
        enum: ['client', 'vendor'],
        description:
          'Optional. Only pass this if the contract makes the side clear, it narrows the search. Leave it out when unsure.',
      },
    },
    additionalProperties: false,
  },
};
