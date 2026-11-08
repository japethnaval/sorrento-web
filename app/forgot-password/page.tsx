import { AuthCard } from "@/components/auth/auth-card";
import { GuestOnly } from "@/components/auth/guest-only";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <GuestOnly>
      <AuthCard
        title="Reset password"
        description="Enter the email your landlord registered. We’ll send a verification code if the account exists."
      >
        <ForgotPasswordForm />
      </AuthCard>
    </GuestOnly>
  );
}
