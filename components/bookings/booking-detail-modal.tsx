"use client";

import { useEffect, useRef, useState } from "react";
import {
  ApiError,
  cancelBooking,
  userMessageForApiError,
} from "@/lib/api-client";
import type { BookingRequest } from "@/lib/api-types";
import { canCancelBooking } from "@/lib/booking-cancel";
import { statusBadgeClass } from "@/lib/booking-status-style";
import { formatCreatedDate, formatMyHomeDateTime } from "@/lib/format";
import {
  getTenantProperty,
  getTenantRequestedBy,
} from "@/lib/tenant-constants";

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-6 py-[11px]">
      <dt className="shrink-0 text-[15px] font-semibold text-[#1a5a8a]">
        {label}
      </dt>
      <dd className="text-right text-[14px] leading-6 text-[#6b7280]">
        {children}
      </dd>
    </div>
  );
}

export function BookingDetailModal({
  request,
  unitId,
  onClose,
  onCancelled,
}: {
  request: BookingRequest;
  /** Tenant unit label (e.g. from `units[0]`). */
  unitId: string;
  onClose: () => void;
  /** Refetch list after cancel or ambiguous outcome (202 / 404). */
  onCancelled?: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [cancelNotice, setCancelNotice] = useState<string | null>(null);
  const [cancelPending, setCancelPending] = useState(false);
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);
  const dateCreated = formatCreatedDate(request.createdDate);
  const adminRemarks = request.remarks?.trim() || null;
  const tenantNotes = request.notes?.trim() || null;
  const showCancel = canCancelBooking(request);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (!dialog.open) dialog.showModal();

    function onCancel(event: Event) {
      event.preventDefault();
      if (confirmCancelOpen) {
        setConfirmCancelOpen(false);
        return;
      }
      onClose();
    }

    function onBackdropClick(event: MouseEvent) {
      if (event.target !== dialog) return;
      if (confirmCancelOpen) {
        setConfirmCancelOpen(false);
        return;
      }
      onClose();
    }

    dialog.addEventListener("cancel", onCancel);
    dialog.addEventListener("click", onBackdropClick);
    return () => {
      dialog.removeEventListener("cancel", onCancel);
      dialog.removeEventListener("click", onBackdropClick);
      if (dialog.open) dialog.close();
    };
  }, [confirmCancelOpen, onClose]);

  function openCancelConfirm() {
    if (!request.cancelId || cancelPending) return;
    setConfirmCancelOpen(true);
  }

  async function performCancel() {
    if (!request.cancelId) return;

    setConfirmCancelOpen(false);
    setCancelError(null);
    setCancelNotice(null);
    setCancelPending(true);
    try {
      const outcome = await cancelBooking(request.cancelId);
      if (outcome.kind === "cancelled") {
        onCancelled?.();
        onClose();
        return;
      }
      setCancelNotice(outcome.message);
      onCancelled?.();
    } catch (error) {
      if (error instanceof ApiError) {
        const message = userMessageForApiError(error);
        setCancelError(message);
        if (
          error.code === "BOOKING_NOT_FOUND" ||
          error.code === "MYHOME_OUTCOME_UNKNOWN"
        ) {
          onCancelled?.();
        }
      } else {
        setCancelError("Could not cancel this booking. Please try again.");
      }
    } finally {
      setCancelPending(false);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="service-request-title"
      className="fixed inset-0 z-50 m-0 flex h-full max-h-none w-full max-w-none items-center justify-center border-0 bg-transparent p-3 shadow-none backdrop:bg-black/45"
    >
      <div className="relative flex max-h-[min(92vh,840px)] w-full max-w-[52rem] flex-col overflow-hidden rounded-sm bg-[#eceff3] shadow-2xl">
        <header className="flex shrink-0 items-center justify-between bg-[#1a5a8a] px-5 py-3.5 text-white">
          <h2 id="service-request-title" className="text-[17px] font-semibold">
            Service Request Details
          </h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center text-2xl leading-none text-white/90 hover:text-white"
          >
            ×
          </button>
        </header>

        <div className="min-h-0 overflow-y-auto bg-[#eceff3]">
          {cancelError ? (
            <p
              role="alert"
              className="mx-2 mt-2 rounded border border-[#f5c6c2] bg-[#fff5f5] px-3 py-2 text-sm text-[#c53030]"
            >
              {cancelError}
            </p>
          ) : null}
          {cancelNotice ? (
            <p
              role="status"
              className="mx-2 mt-2 rounded border border-[#f0e0b5] bg-[#fff8e6] px-3 py-2 text-sm text-[#9a6700]"
            >
              {cancelNotice}
            </p>
          ) : null}

          <section className="bg-white px-5 py-2">
            <dl>
              <Row label="Service Request No.:">{request.id}</Row>
              <Row label="Status:">
                <span
                  className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadgeClass(request.status)}`}
                >
                  {request.status}
                </span>
              </Row>
              {showCancel ? (
                <Row label="Action:">
                  <button
                    type="button"
                    disabled={cancelPending}
                    onClick={openCancelConfirm}
                    className="rounded border-2 border-[#e53935] bg-white px-3 py-0.5 text-sm font-medium text-[#e53935] hover:bg-[#fff5f5] disabled:opacity-60"
                  >
                    {cancelPending ? "Cancelling…" : "Cancel Request"}
                  </button>
                </Row>
              ) : null}
              <Row label="Date Created:">{dateCreated ?? "—"}</Row>
              <Row label="Requested By:">{getTenantRequestedBy()}</Row>
              <Row label="Property:">{getTenantProperty()}</Row>
              <Row label="Unit:">{unitId}</Row>
            </dl>
          </section>

          <section className="mt-2 bg-white px-5 pb-3 pt-4">
            <h3 className="mb-1 text-[16px] font-semibold text-[#1a5a8a]">
              Service Request Details
            </h3>
            <dl>
              <Row label="Start Date and Time of Event/Activity">
                {formatMyHomeDateTime(request.start)}
              </Row>
              <Row label="End Date and Time of Event/Activity">
                {formatMyHomeDateTime(request.end)}
              </Row>
              <Row label="No of Guest if applicable">{request.guestCount}</Row>
              <Row label="List of Amenities">{request.amenity || "—"}</Row>
              <Row label="Notes">
                <span className="whitespace-pre-wrap text-left">
                  {tenantNotes ?? "—"}
                </span>
              </Row>
            </dl>
          </section>

          {adminRemarks ? (
            <section className="mt-2 border-t-4 border-[#1a5a8a] bg-white px-5 py-4">
              <h3 className="text-[16px] font-semibold text-[#1a5a8a]">
                Remarks
              </h3>
              <p className="mt-2 text-left text-[14px] leading-6 whitespace-pre-wrap text-[#374151]">
                {adminRemarks}
              </p>
            </section>
          ) : null}
        </div>

        {confirmCancelOpen ? (
          <div
            className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 p-4"
            onClick={() => setConfirmCancelOpen(false)}
          >
            <div
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="cancel-confirm-title"
              aria-describedby="cancel-confirm-desc"
              className="w-full max-w-sm overflow-hidden rounded-sm bg-white shadow-xl"
              onClick={(event) => event.stopPropagation()}
            >
              <header className="bg-[#1a5a8a] px-5 py-3.5">
                <h3
                  id="cancel-confirm-title"
                  className="text-[16px] font-semibold text-white"
                >
                  Cancel this booking?
                </h3>
              </header>
              <div className="px-5 py-4">
                <p
                  id="cancel-confirm-desc"
                  className="text-sm leading-6 text-[#6b7280]"
                >
                  This will cancel service request{" "}
                  <span className="font-mono text-xs text-foreground">
                    {request.id}
                  </span>
                  . You can submit a new booking later if you still need the
                  amenity.
                </p>
                <div className="mt-5 flex flex-wrap justify-end gap-2">
                  <button
                    type="button"
                    disabled={cancelPending}
                    onClick={() => setConfirmCancelOpen(false)}
                    className="rounded border border-[#d1d5db] bg-white px-4 py-2 text-sm font-medium text-[#1a5a8a] hover:bg-[#f3f6f9]"
                  >
                    Keep booking
                  </button>
                  <button
                    type="button"
                    disabled={cancelPending}
                    onClick={() => void performCancel()}
                    className="rounded border-2 border-[#e53935] bg-white px-4 py-2 text-sm font-medium text-[#e53935] hover:bg-[#fff5f5] disabled:opacity-60"
                  >
                    {cancelPending ? "Cancelling…" : "Yes, cancel request"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </dialog>
  );
}
