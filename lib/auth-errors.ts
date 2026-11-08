import { PASSWORD_POLICY_HINT } from "@/lib/password-policy";

export function userMessageForAuthError(error: unknown): string {
  const name =
    error && typeof error === "object" && "name" in error
      ? String(error.name)
      : "";
  const message =
    error && typeof error === "object" && "message" in error
      ? String(error.message)
      : "";

  switch (name) {
    case "NotAuthorizedException":
    case "UserNotFoundException":
      return "Email or password is incorrect.";
    case "UserNotConfirmedException":
      return "This account is not confirmed yet. Please contact the landlord.";
    case "PasswordResetRequiredException":
      return "You need to reset your password before signing in.";
    case "LimitExceededException":
    case "TooManyRequestsException":
      return "Too many attempts. Please wait a moment and try again.";
    case "CodeMismatchException":
      return "That verification code is not valid.";
    case "ExpiredCodeException":
      return "That verification code has expired. Request a new one.";
    case "InvalidPasswordException":
      return `Password does not meet policy. ${PASSWORD_POLICY_HINT}`;
    case "InvalidParameterException":
      return message || "Check the details and try again.";
    default:
      return message || "Something went wrong. Please try again.";
  }
}
