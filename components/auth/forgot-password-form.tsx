"use client";

import { confirmResetPassword, resetPassword } from "aws-amplify/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { userMessageForAuthError } from "@/lib/auth-errors";
import { passwordMeetsPolicy } from "@/lib/format";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, inputClassName } from "@/components/ui/field";

export function ForgotPasswordForm() {
  const router = useRouter();
  const [step, setStep] = useState<"request" | "confirm">("request");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onRequest(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);
    try {
      await resetPassword({ username: email.trim() });
      setStep("confirm");
    } catch (caught) {
      setError(userMessageForAuthError(caught));
    } finally {
      setPending(false);
    }
  }

  async function onConfirm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const policyError = passwordMeetsPolicy(password);
    if (policyError) {
      setError(policyError);
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setPending(true);
    try {
      await confirmResetPassword({
        username: email.trim(),
        confirmationCode: code.trim(),
        newPassword: password,
      });
      router.replace("/login");
    } catch (caught) {
      setError(userMessageForAuthError(caught));
    } finally {
      setPending(false);
    }
  }

  if (step === "confirm") {
    return (
      <form onSubmit={onConfirm} className="flex flex-col gap-5">
        {error ? <Alert>{error}</Alert> : null}
        <Alert tone="info">
          If that email has an account, a verification code was sent.
        </Alert>

        <Field label="Verification code" htmlFor="code">
          <input
            id="code"
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            required
            value={code}
            onChange={(event) => setCode(event.target.value)}
            className={inputClassName}
          />
        </Field>

        <Field
          label="New password"
          htmlFor="password"
          hint="At least 12 characters, with upper, lower, number, and symbol."
        >
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className={inputClassName}
          />
        </Field>

        <Field label="Confirm password" htmlFor="confirm">
          <input
            id="confirm"
            name="confirm"
            type="password"
            autoComplete="new-password"
            required
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
            className={inputClassName}
          />
        </Field>

        <Button type="submit" disabled={pending}>
          {pending ? "Updating…" : "Update password"}
        </Button>

        <p className="text-center text-sm">
          <Link href="/login" className="text-accent hover:underline">
            Back to sign in
          </Link>
        </p>
      </form>
    );
  }

  return (
    <form onSubmit={onRequest} className="flex flex-col gap-5">
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

      <Button type="submit" disabled={pending}>
        {pending ? "Sending…" : "Send reset code"}
      </Button>

      <p className="text-center text-sm">
        <Link href="/login" className="text-accent hover:underline">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
