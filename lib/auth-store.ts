"use client";

import { fetchAuthSession, signOut } from "aws-amplify/auth";
import { Hub } from "aws-amplify/utils";
import { configureAmplify } from "@/lib/amplify";

configureAmplify();

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

let status: AuthStatus = "loading";
const listeners = new Set<() => void>();
let started = false;

function emit() {
  for (const listener of listeners) listener();
}

function setAuthStatus(next: AuthStatus) {
  if (status === next) return;
  status = next;
  emit();
}

async function readSession() {
  try {
    const session = await fetchAuthSession();
    setAuthStatus(session.tokens?.idToken ? "authenticated" : "unauthenticated");
  } catch {
    setAuthStatus("unauthenticated");
  }
}

function ensureStarted() {
  if (started) return;
  started = true;
  void readSession();
  Hub.listen("auth", ({ payload }) => {
    if (payload.event === "signedIn") {
      setAuthStatus("authenticated");
    }
    if (payload.event === "signedOut") {
      setAuthStatus("unauthenticated");
    }
    if (payload.event === "tokenRefresh_failure") {
      void readSession();
    }
  });
}

export function subscribeAuth(listener: () => void) {
  ensureStarted();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getAuthStatus() {
  ensureStarted();
  return status;
}

export function getServerAuthStatus(): AuthStatus {
  return "loading";
}

export async function refreshAuth() {
  await readSession();
  return status;
}

export async function signOutUser() {
  await signOut();
  setAuthStatus("unauthenticated");
}
