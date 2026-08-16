import { ReviewCardArgs } from './type/reviewCard.type';
import { ApprovedCardArgs } from './type/approvedCard.type';

// trello card descriptions are MARKDOWN, not html like the emails are.
// the only thing we have to neutralise is a stray backtick or pipe breaking a table row.
const clean = (value: string): string =>
  String(value ?? '')
    .replace(/\|/g, '\\|')
    .replace(/`/g, "'")
    .trim();

const reference = (contractReference?: string): string =>
  contractReference ? ` (${clean(contractReference)})` : '';

export const buildReviewCardDescription = (args: ReviewCardArgs): string => {
  const parts = [
    `**${clean(args.counterparty_name)}**${reference(args.contract_reference)}`,
    '',
    clean(args.summary),
    '',
    '### Why it was flagged',
    ...args.reasons.map(
      (item) => `- **${clean(item.reason)}** — ${clean(item.detail)}`,
    ),
  ];

  if (args.draft_subject) {
    parts.push(
      '',
      `A Gmail draft is waiting in Drafts: _${clean(args.draft_subject)}_`,
    );
  }

  parts.push('', '---', 'Flagged automatically by the Contract Intake Agent.');

  return parts.join('\n');
};

export const buildApprovedCardDescription = (args: ApprovedCardArgs): string => {
  const parts = [
    `**${clean(args.counterparty_name)}**${reference(args.contract_reference)}`,
    '',
    clean(args.summary),
  ];

  if (args.checks_passed?.length) {
    parts.push(
      '',
      '### Checks passed',
      ...args.checks_passed.map((check) => `- ${clean(check)}`),
    );
  }

  parts.push(
    '',
    '---',
    'Auto-approved by the Contract Intake Agent, confirmation email already sent. No review required.',
  );

  return parts.join('\n');
};
