"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  ApiError,
  UnauthenticatedError,
  listBookings,
  userMessageForApiError,
} from "@/lib/api-client";
import {
  BOOKING_STATUSES,
  isBookingStatus,
  type BookingRequest,
  type BookingStatus,
  type ListBookingsResponse,
} from "@/lib/api-types";
import { statusBadgeClass } from "@/lib/booking-status-style";
import { formatCreatedDate, formatLocalRange } from "@/lib/format";
import { loadUnits } from "@/lib/units-cache";
import { BookingDetailModal } from "@/components/bookings/booking-detail-modal";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 20;

type ListResult =
  | { ok: true; data: ListBookingsResponse }
  | { ok: false; error: unknown };

function loadPage(status: string, skip: number): Promise<ListResult> {
  return listBookings({ status, skip, take: PAGE_SIZE }).then(
    (data) => ({ ok: true, data }),
    (error: unknown) => ({ ok: false, error }),
  );
}

function errorMessage(error: unknown): string {
  if (error instanceof UnauthenticatedError) {
    return "Could not load bookings. Please try again.";
  }
  if (error instanceof ApiError) {
    return userMessageForApiError(error);
  }
  return "Could not load bookings. Please try again.";
}

export function BookingList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const statusParam = searchParams.get("status");
  const status: BookingStatus = isBookingStatus(statusParam ?? "")
    ? (statusParam as BookingStatus)
    : "New";
  const notice = searchParams.get("notice");
  const [unitId, setUnitId] = useState<string | null>(
    () => loadUnits()[0] ?? null,
  );

  function onStatus(next: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("status", next);
    params.delete("notice");
    router.replace(`/bookings?${params.toString()}`);
  }

  return (
    <BookingChrome
      status={status}
      notice={notice}
      onStatus={onStatus}
      unitId={unitId}
    >
      <BookingResults key={status} status={status} onUnitId={setUnitId} />
    </BookingChrome>
  );
}

function BookingResults({
  status,
  onUnitId,
}: {
  status: BookingStatus;
  onUnitId: (unitId: string | null) => void;
}) {
  const [result, setResult] = useState<ListResult | null>(null);
  const [extra, setExtra] = useState<BookingRequest[]>([]);
  const [skip, setSkip] = useState(0);
  const [lastPageCount, setLastPageCount] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);
  const [selected, setSelected] = useState<BookingRequest | null>(null);
  const [listVersion, setListVersion] = useState(0);
  const closeSelected = useCallback(() => setSelected(null), []);
  const displayUnitId = result?.ok ? (result.data.units[0] ?? "—") : "—";

  useEffect(() => {
    let cancelled = false;

    loadPage(status, 0).then((next) => {
      if (cancelled) return;
      setResult(next);
      if (next.ok) {
        onUnitId(next.data.units[0] ?? null);
        setLastPageCount(next.data.requests.length);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [status, retry, listVersion, onUnitId]);

  async function onLoadMore() {
    setLoadingMore(true);
    setLoadMoreError(null);
    const nextSkip = skip + PAGE_SIZE;
    const next = await loadPage(status, nextSkip);
    setLoadingMore(false);

    if (!next.ok) {
      setLoadMoreError(errorMessage(next.error));
      return;
    }

    setExtra((current) => [...current, ...next.data.requests]);
    setSkip(nextSkip);
    setLastPageCount(next.data.requests.length);
  }

  if (!result) {
    return (
      <div className="flex flex-col gap-3">
        {[0, 1, 2].map((key) => (
          <div
            key={key}
            className="h-28 animate-pulse rounded-xl border border-border bg-card"
          />
        ))}
      </div>
    );
  }

  if (!result.ok) {
    return (
      <div className="flex flex-col gap-3">
        <Alert>{errorMessage(result.error)}</Alert>
        <Button
          variant="secondary"
          type="button"
          onClick={() => {
            setResult(null);
            setRetry((value) => value + 1);
          }}
        >
          Try again
        </Button>
      </div>
    );
  }

  const requests = [...result.data.requests, ...extra];
  const hasMore = lastPageCount === PAGE_SIZE;

  return (
    <>
      {loadMoreError ? <Alert>{loadMoreError}</Alert> : null}

      {requests.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card px-6 py-12 text-center">
          <p className="font-medium">No bookings in {status}</p>
          <p className="mt-1 text-sm text-muted">
            {result.data.units[0]
              ? `Nothing in this status for unit ${result.data.units[0]}.`
              : "Try another status, or make a new booking."}
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {requests.map((request) => (
            <li key={request.id}>
              <button
                type="button"
                onClick={() => setSelected(request)}
                className="w-full rounded-sm border border-border bg-card p-4 text-left shadow-sm transition-colors hover:border-accent/40 hover:bg-white"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{request.amenity}</p>
                    <p className="mt-1 text-sm text-muted">
                      {formatLocalRange(request.start, request.end)}
                    </p>
                  </div>
                  <span
                    className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${statusBadgeClass(request.status)}`}
                  >
                    {request.status}
                  </span>
                </div>
                <dl className="mt-3 grid gap-1 text-sm text-muted sm:grid-cols-2">
                  <div>
                    <dt className="inline text-foreground">Reference: </dt>
                    <dd className="inline font-mono text-xs">{request.id}</dd>
                  </div>
                  <div>
                    <dt className="inline text-foreground">Guests: </dt>
                    <dd className="inline">{request.guestCount}</dd>
                  </div>
                  {formatCreatedDate(request.createdDate) ? (
                    <div className="sm:col-span-2">
                      <dt className="inline text-foreground">Requested: </dt>
                      <dd className="inline">
                        {formatCreatedDate(request.createdDate)}
                      </dd>
                    </div>
                  ) : null}
                </dl>
                {request.notes?.trim() ? (
                  <p className="mt-2 line-clamp-2 text-sm whitespace-pre-wrap text-muted">
                    <span className="font-medium text-foreground">Notes: </span>
                    {request.notes.trim()}
                  </p>
                ) : null}
                {request.remarks?.trim() ? (
                  <div className="mt-2 rounded-md border border-[#1a5a8a]/25 bg-[#e8f0f8] px-3 py-2 text-left">
                    <p className="text-xs font-semibold text-[#1a5a8a]">
                      Remarks
                    </p>
                    <p className="mt-1 line-clamp-4 text-sm leading-relaxed whitespace-pre-wrap text-[#374151]">
                      {request.remarks.trim()}
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      Open for full text — show this to the guard when approved.
                    </p>
                  </div>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      )}

      {selected && result.ok ? (
        <BookingDetailModal
          request={selected}
          unitId={displayUnitId}
          onClose={closeSelected}
          onCancelled={() => {
            setExtra([]);
            setSkip(0);
            setListVersion((value) => value + 1);
          }}
        />
      ) : null}

      {hasMore ? (
        <Button
          variant="secondary"
          type="button"
          disabled={loadingMore}
          onClick={() => void onLoadMore()}
        >
          {loadingMore ? "Loading…" : "Load more"}
        </Button>
      ) : null}
    </>
  );
}

function BookingChrome({
  status,
  notice,
  unitId,
  statuses = BOOKING_STATUSES,
  onStatus,
  children,
}: {
  status: string;
  notice: string | null;
  unitId: string | null;
  statuses?: string[];
  onStatus: (next: string) => void;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-accent">
              My bookings
            </h1>
            {unitId ? (
              <span className="rounded-full border border-accent/25 bg-accent-soft px-2.5 py-1 text-xs font-semibold text-accent">
                Unit {unitId}
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-sm text-muted">
            {unitId
              ? `Requests for unit ${unitId}. Newly submitted ones usually appear under New.`
              : "Newly submitted requests usually appear under New."}
          </p>
        </div>
        <Link
          href="/bookings/new"
          className="inline-flex items-center justify-center rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-hover"
        >
          New booking
        </Link>
      </div>

      {notice === "check-list" ? (
        <Alert tone="warning">
          The request may have been submitted. Check this list before booking
          again.
        </Alert>
      ) : null}
      {notice === "created" ? (
        <Alert tone="info">Your booking request was submitted.</Alert>
      ) : null}

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Booking status">
        {statuses.map((item) => {
          const active = item === status;
          return (
            <button
              key={item}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onStatus(item)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium ${
                active
                  ? "bg-accent text-white"
                  : "border border-border bg-card text-muted hover:bg-accent-soft"
              }`}
            >
              {item}
            </button>
          );
        })}
      </div>

      {children}
    </div>
  );
}
