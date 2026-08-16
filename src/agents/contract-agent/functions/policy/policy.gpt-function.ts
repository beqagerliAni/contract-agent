import { FunctionTool } from 'openai/resources/responses/responses';
import { FunctionName } from '../../enum/FunctionNames.enum';

export const SearchPolicies: FunctionTool = {
  type: 'function',
  strict: false,
  name: FunctionName.searchPolicies,
  description: `Retrieves the internal company policies that apply to a set of extracted contract terms, so you can check whether the contract breaches any of them.
Use this tool after extracting the terms of a contract and before deciding whether it can be auto-approved or must go to human review.

Pass the extracted terms as plain text, including the numbers you found, for example "auto-renews for 24 months, payment terms net 90, 15 day termination notice period". The tool runs a semantic search over the policy knowledge base and returns the policy text that most closely relates to those terms, together with a similarity score.

The tool returns relevant policy text. It does NOT decide whether a term is compliant, that judgement is yours:
- Compare each extracted number against the limit stated in the returned policy text
- A contract breaches policy when a term is worse than the limit the policy allows (for example a 24 month auto-renewal against a 12 month cap)
- Quote the specific policy wording you relied on when you report a violation
- If the returned policies do not cover a term, say so and route the contract to review rather than assuming it is compliant

Call this tool once per extracted contract, covering all of the terms in a single query.`,
  parameters: {
    type: 'object',
    properties: {
      text: {
        type: 'string',
        description:
          'The extracted contract terms as plain text, including the actual values found, for example "auto-renewal term 24 months, payment terms net 90 days, notice period 15 days".',
      },
    },
    required: ['text'],
    additionalProperties: false,
  },
};