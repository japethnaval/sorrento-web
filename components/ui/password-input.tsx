"use client";

import { useId, useState } from "react";
import { inputClassName } from "@/components/ui/field";

type PasswordInputProps = {
  id?: string;
  name: string;
  autoComplete?: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg
        aria-hidden
        className="size-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.75}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 3l18 18M10.477 10.48a3 3 0 004.243 4.243M9.88 9.88A3 3 0 0112 9c2.5 0 4.2 1.9 5.2 3.5-.5.7-1.1 1.4-1.7 2M6.7 6.7C4.6 8 2.9 10.1 2 12c1.7 2.8 4.5 5 7.5 6 1 .3 2 .5 3 .5"
        />
      </svg>
    );
  }
  return (
    <svg
      aria-hidden
      className="size-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.75}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.036 12.322a1 1 0 010-.644C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .644C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  );
}

export function PasswordInput({
  id: idProp,
  name,
  autoComplete,
  required,
  value,
  onChange,
  disabled,
}: PasswordInputProps) {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        id={id}
        name={name}
        type={visible ? "text" : "password"}
        autoComplete={autoComplete}
        required={required}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className={`${inputClassName} pr-10`}
      />
      <button
        type="button"
        disabled={disabled}
        onClick={() => setVisible((on) => !on)}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        className="absolute top-1/2 right-2 flex -translate-y-1/2 items-center justify-center rounded-md p-1.5 text-muted transition-colors hover:text-foreground disabled:opacity-60"
      >
        <EyeIcon open={visible} />
      </button>
    </div>
  );
}
