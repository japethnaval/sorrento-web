import { AuthCard } from "@/components/auth/auth-card";
import { GuestOnly } from "@/components/auth/guest-only";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <GuestOnly>
      <AuthCard
        title="Sign in"
        description="Use the email and password your landlord gave you. There is no self-registration."
      >
        <LoginForm />
      </AuthCard>
    </GuestOnly>
  );
}
