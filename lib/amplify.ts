"use client";

import { Amplify } from "aws-amplify";
import { getPublicEnv } from "@/lib/env";

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
            minLength: 12,
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
