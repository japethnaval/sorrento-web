"use client";

import { signIn } from "aws-amplify/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { userMessageForAuthError } from "@/lib/auth-errors";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, inputClassName } from "@/components/ui/field";
import { PasswordInput } from "@/components/ui/password-input";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    try {
      const result = await signIn({
        username: email.trim(),
        password,
      });

      if (
        result.nextStep.signInStep ===
        "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED"
      ) {
        router.replace("/login/new-password");
        return;
      }

      if (result.nextStep.signInStep === "RESET_PASSWORD") {
        router.replace("/forgot-password");
        return;
      }

      if (result.nextStep.signInStep === "DONE") {
        router.replace("/bookings");
        return;
      }

      setError(
        "This sign-in step is not supported. Please contact the landlord.",
      );
    } catch (caught) {
      const name =
        caught && typeof caught === "object" && "name" in caught
          ? String(caught.name)
          : "";
      if (name === "UserAlreadyAuthenticatedException") {
        router.replace("/bookings");
        return;
      }
      if (name === "PasswordResetRequiredException") {
        router.replace("/forgot-password");
        return;
      }
      setError(userMessageForAuthError(caught));
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      {error ? <Alert>{error}</Alert> : null}

      <Field label="Email" htmlFor="email">
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className={inputClassName}
        />
      </Field>

      <Field label="Password" htmlFor="password">
        <PasswordInput
          id="password"
          name="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={setPassword}
        />
      </Field>

      <Button type="submit" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </Button>

      <p className="text-center text-sm">
        <Link href="/forgot-password" className="text-accent hover:underline">
          Forgot password?
        </Link>
      </p>
    </form>
  );
}
