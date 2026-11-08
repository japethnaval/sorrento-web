import { AuthCard } from "@/components/auth/auth-card";
import { NewPasswordForm } from "@/components/auth/new-password-form";

export default function NewPasswordPage() {
  return (
    <AuthCard
      title="Set a new password"
      description="Your first sign-in uses a temporary password. Choose a permanent one to continue."
    >
      <NewPasswordForm />
    </AuthCard>
  );
}
