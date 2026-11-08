"use client";

import { Amplify } from "aws-amplify";
import { getPublicEnv } from "@/lib/env";
import { PASSWORD_MIN_LENGTH } from "@/lib/password-policy";

let configured = false;

export function configureAmplify() {
  if (configured) return;

  const { userPoolId, userPoolClientId } = getPublicEnv();

  Amplify.configure(
    {
      Auth: {
        Cognito: {
          userPoolId,
          userPoolClientId,
          loginWith: {
            email: true,
          },
          passwordFormat: {
            minLength: PASSWORD_MIN_LENGTH,
            requireLowercase: true,
            requireUppercase: true,
            requireNumbers: true,
            requireSpecialCharacters: true,
          },
        },
      },
    },
    { ssr: false },
  );

  configured = true;
}
