export type DraftIssue = {
  term: string;
  found: string;
  policy_limit: string;
  source?: string;
};

export type CreateGmailDraftArgs = {
  to: string;
  subject: string;
  counterparty_name: string;
  contract_reference?: string;
  summary: string;
  issues?: DraftIssue[];
  requested_action: string;
  deadline?: string;
  threadId?: string;
};
