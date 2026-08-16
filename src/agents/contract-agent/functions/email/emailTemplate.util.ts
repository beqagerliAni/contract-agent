import { CreateGmailDraftArgs, DraftIssue } from './type/createGmailDraft.type';
import { SendGmailEmailArgs } from './type/sendGmailEmail.type';

// everything in here comes from the model, so it gets escaped before it touches the html
const escape = (value: string): string =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const buildIssuesTable = (issues: DraftIssue[]): string => {
  const rows = issues
    .map(
      (issue) => `<tr>
      <td><strong>${escape(issue.term)}</strong></td>
      <td>${escape(issue.found)}</td>
      <td>${escape(issue.policy_limit)}</td>
      <td>${escape(issue.source ?? '-')}</td>
    </tr>`,
    )
    .join('');

  return `<table border="1" cellpadding="6" cellspacing="0">
    <thead>
      <tr>
        <th>Term</th>
        <th>In contract</th>
        <th>Policy limit</th>
        <th>Source</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>`;
};

export const buildDraftHtml = (args: CreateGmailDraftArgs): string => {
  const reference = args.contract_reference
    ? ` (${escape(args.contract_reference)})`
    : '';

  const parts = [
    `<p>Hello,</p>`,
    `<p>We reviewed the contract from <strong>${escape(args.counterparty_name)}</strong>${reference} and flagged it for review before it can be approved.</p>`,
    `<p>${escape(args.summary)}</p>`,
  ];

  if (args.issues?.length) {
    parts.push(buildIssuesTable(args.issues));
  }

  parts.push(
    `<p><strong>What we need from you:</strong> ${escape(args.requested_action)}</p>`,
  );

  if (args.deadline) {
    parts.push(`<p>Please reply by ${escape(args.deadline)}.</p>`);
  }

  parts.push(`<p>Thank you.</p>`);

  return parts.join('\n');
};

export const buildApprovalHtml = (args: SendGmailEmailArgs): string => {
  const reference = args.contract_reference
    ? ` (${escape(args.contract_reference)})`
    : '';

  const parts = [
    `<p>Hello,</p>`,
    `<p>The contract from <strong>${escape(args.counterparty_name)}</strong>${reference} has been processed and approved. No further action is needed from you.</p>`,
    `<p>${escape(args.message)}</p>`,
    `<p>Thank you.</p>`,
  ];

  return parts.join('\n');
};
