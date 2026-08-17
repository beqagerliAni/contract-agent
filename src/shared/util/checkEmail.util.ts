const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const checkEmail = (value: string): string[] => {
  const address = String(value ?? '').trim();

  if (EMAIL_PATTERN.test(address)) {
    return [];
  }

  return [
    `"${address}" is not an email address. The "to" field needs a full address such as "name@company.com", not a person's or company's name. Look for the sender address in the conversation or the contract, and if there is none, ask for it instead of guessing.`,
  ];
};
