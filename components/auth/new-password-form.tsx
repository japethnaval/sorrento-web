"use client";

import { confirmSignIn } from "aws-amplify/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { userMessageForAuthError } from "@/lib/auth-errors";
import { passwordMeetsPolicy } from "@/lib/format";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, inputClassName } from "@/components/ui/field";

export function NewPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
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
      const result = await confirmSignIn({ challengeResponse: password });
      if (result.nextStep.signInStep === "DONE") {
        router.replace("/bookings");
        return;
      }
      setError("Could not finish setting your password. Sign in again.");
    } catch (caught) {
      setError(userMessageForAuthError(caught));
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      {error ? <Alert>{error}</Alert> : null}

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
        {pending ? "Saving…" : "Save password"}
      </Button>

      <p className="text-center text-sm">
        <Link href="/login" className="text-accent hover:underline">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
