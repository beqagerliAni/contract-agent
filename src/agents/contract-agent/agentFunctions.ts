import { AvailableFunctionsType } from 'src/openai/type/agentFunction.type';
import { FunctionName } from './enum/FunctionNames.enum';
import { SearchKnownClients } from './functions/company/company.gpt-function';
import { searchKnownClientsProcessor } from './functions/company/company.function-processors';
import { SearchPolicies } from './functions/policy/policy.gpt-function';
import { searchPoliciesProcessor } from './functions/policy/policy.function-processors';
import { CreateGmailDraft } from './functions/email/create-draft/email.gpt-function';
import { createGmailDraftProcessor } from './functions/email/create-draft/email.function-processors';
import { SendGmailEmail } from './functions/email/send-email/sendEmail.gpt-function';
import { sendGmailEmailProcessor } from './functions/email/send-email/sendEmail.function-processors';

export const ContractAgentFunctions: Record<string, AvailableFunctionsType> = {
  [FunctionName.searchKnownClients]: {
    gptFunction: SearchKnownClients,
    processor: searchKnownClientsProcessor,
  },
  [FunctionName.searchPolicies]: {
    gptFunction: SearchPolicies,
    processor: searchPoliciesProcessor,
  },
  [FunctionName.createGmailDraft]: {
    gptFunction: CreateGmailDraft,
    processor: createGmailDraftProcessor,
  },
  [FunctionName.sendGmailEmail]: {
    gptFunction: SendGmailEmail,
    processor: sendGmailEmailProcessor,
  },
};