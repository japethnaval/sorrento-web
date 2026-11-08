import { fetchAuthSession } from "aws-amplify/auth";
import { getPublicEnv } from "@/lib/env";
import { saveUnits } from "@/lib/units-cache";
import type {
  ApiErrorBody,
  CancelBookingSuccess,
  CreateBookingRequest,
  CreateBookingSuccess,
  ListBookingsResponse,
} from "@/lib/api-types";

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class UnauthenticatedError extends Error {
  constructor(message = "You need to sign in again.") {
    super(message);
    this.name = "UnauthenticatedError";
  }
}

export function userMessageForApiError(error: ApiError): string {
  switch (error.code) {
    case "TENANT_NOT_AUTHORIZED":
      return "Your account is not set up for bookings. Please contact the landlord.";
    case "UNIT_NOT_AUTHORIZED":
      return "That unit is not assigned to your account.";
    case "MYHOME_SESSION_EXPIRED":
      return "Booking is temporarily unavailable. Please try again later.";
    case "MYHOME_OUTCOME_UNKNOWN":
      return "The request may have been submitted. Check your booking list before booking again.";
    case "MYHOME_REJECTED":
      return error.message || "The booking was rejected.";
    case "BOOKING_NOT_FOUND":
      return "This booking was not found. It may already be cancelled — refresh the list.";
    case "INVALID_REQUEST":
      return error.message || "That request could not be cancelled.";
    case "UNAUTHENTICATED":
      return "You need to sign in again.";
    default:
      return error.message || "Something went wrong. Please try again.";
  }
}

async function getIdToken(forceRefresh = false): Promise<string> {
  const session = await fetchAuthSession({ forceRefresh });
  const token = session.tokens?.idToken?.toString();
  if (!token) {
    throw new UnauthenticatedError();
  }
  return token;
}

function parseErrorBody(data: unknown): { code: string; message: string } | null {
  if (!data || typeof data !== "object") return null;
  const body = data as Partial<ApiErrorBody> & { ok?: boolean };
  const error = body.error;
  if (!error || typeof error !== "object") return null;
  const code = typeof error.code === "string" ? error.code : "UNKNOWN";
  const message =
    typeof error.message === "string" ? error.message : "Request failed.";
  return { code, message };
}

async function parseJson(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

async function apiFetch(
  path: string,
  init: RequestInit = {},
  retried = false,
): Promise<Response> {
  const token = await getIdToken(retried);
  const { apiUrl } = getPublicEnv();
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${apiUrl}${path}`, {
    ...init,
    headers,
  });

  if (response.status === 401 && !retried) {
    return apiFetch(path, init, true);
  }

  if (response.status === 401) {
    throw new UnauthenticatedError();
  }

  return response;
}

function throwApiError(status: number, data: unknown): never {
  const parsed = parseErrorBody(data);
  throw new ApiError(
    status,
    parsed?.code ?? "UNKNOWN",
    parsed?.message ?? "Request failed.",
  );
}

export async function listBookings(options: {
  status?: string;
  skip?: number;
  take?: number;
}): Promise<ListBookingsResponse> {
  const params = new URLSearchParams();
  if (options.status) params.set("status", options.status);
  params.set("skip", String(options.skip ?? 0));
  params.set("take", String(options.take ?? 20));

  const response = await apiFetch(`/bookings?${params.toString()}`);
  const data = await parseJson(response);

  if (!response.ok) {
    throwApiError(response.status, data);
  }

  const payload = data as ListBookingsResponse;
  if (Array.isArray(payload.units)) {
    saveUnits(payload.units);
  }
  return payload;
}

export type CreateBookingResult =
  | { kind: "created"; data: CreateBookingSuccess }
  | { kind: "unknown"; message: string };

export async function createBooking(
  body: CreateBookingRequest,
): Promise<CreateBookingResult> {
  const response = await apiFetch("/bookings", {
    method: "POST",
    body: JSON.stringify(body),
  });
  const data = await parseJson(response);

  if (response.status === 201) {
    return { kind: "created", data: data as CreateBookingSuccess };
  }

  if (response.status === 202) {
    const parsed = parseErrorBody(data);
    return {
      kind: "unknown",
      message:
        parsed?.message ||
        "The request may have been submitted. Check your booking list before booking again.",
    };
  }

  throwApiError(response.status, data);
}

export type CancelBookingResult =
  | { kind: "cancelled"; data: CancelBookingSuccess }
  | { kind: "unknown"; message: string };

export async function cancelBooking(
  cancelId: string,
): Promise<CancelBookingResult> {
  const id = cancelId.trim();
  if (!id) {
    throw new ApiError(400, "INVALID_REQUEST", "Missing cancel id.");
  }

  const response = await apiFetch(
    `/bookings/${encodeURIComponent(id)}`,
    { method: "DELETE" },
  );
  const data = await parseJson(response);

  if (response.status === 200) {
    const payload = data as {
      ok?: boolean;
      id?: string;
      cancelId?: string;
    };
    if (payload.ok === false) {
      throwApiError(response.status, data);
    }
    return {
      kind: "cancelled",
      data: {
        ok: true,
        id: typeof payload.id === "string" ? payload.id : "",
        cancelId:
          typeof payload.cancelId === "string" ? payload.cancelId : id,
      },
    };
  }

  if (response.status === 202) {
    const parsed = parseErrorBody(data);
    return {
      kind: "unknown",
      message:
        parsed?.message ||
        "The cancel may have gone through. Refresh the list before trying again.",
    };
  }

  throwApiError(response.status, data);
}
