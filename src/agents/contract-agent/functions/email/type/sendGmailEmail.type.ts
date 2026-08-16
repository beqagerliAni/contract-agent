export type SendGmailEmailArgs = {
  to: string;
  subject: string;
  counterparty_name: string;
  contract_reference?: string;
  message: string;
  threadId?: string;
};
