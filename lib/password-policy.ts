/** Keep in sync with Cognito user pool password policy. */
export const PASSWORD_MIN_LENGTH = 8;

export const PASSWORD_POLICY_HINT = `At least ${PASSWORD_MIN_LENGTH} characters, with upper, lower, number, and symbol.`;

export function passwordMeetsPolicy(password: string): string | null {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `Use at least ${PASSWORD_MIN_LENGTH} characters.`;
  }
  if (!/[a-z]/.test(password)) return "Include a lowercase letter.";
  if (!/[A-Z]/.test(password)) return "Include an uppercase letter.";
  if (!/[0-9]/.test(password)) return "Include a number.";
  if (!/[^A-Za-z0-9]/.test(password)) return "Include a symbol.";
  return null;
}
