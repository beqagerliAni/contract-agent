export type FlagReason = {
  reason: string;
  detail: string;
};

export type ReviewCardArgs = {
  title: string;
  counterparty_name: string;
  contract_reference?: string;
  summary: string;
  reasons: FlagReason[];
  draft_subject?: string;
};
