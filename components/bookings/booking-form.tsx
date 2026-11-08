"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AMENITIES, AMENITY_IDS } from "@/lib/amenities";
import {
  ApiError,
  UnauthenticatedError,
  createBooking,
  listBookings,
  userMessageForApiError,
} from "@/lib/api-client";
import {
  validateBooking,
  type BookingFieldErrors,
  type BookingFormValues,
} from "@/lib/booking-validation";
import { addDaysToLocal, manilaNowLocal } from "@/lib/format";
import { loadUnits } from "@/lib/units-cache";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, inputClassName } from "@/components/ui/field";

type UnitsResult =
  | { ok: true; units: string[] }
  | { ok: false; error: unknown };

function loadTenantUnits(): Promise<UnitsResult> {
  return listBookings({ status: "New", skip: 0, take: 1 }).then(
    (data) => ({ ok: true, units: data.units }),
    (error: unknown) => {
      const cached = loadUnits();
      if (cached.length > 0) return { ok: true, units: cached };
      return { ok: false, error };
    },
  );
}

function unitsErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return userMessageForApiError(error);
  return "Could not load your units. Please try again.";
}

export function BookingForm() {
  const router = useRouter();
  const [units, setUnits] = useState<string[]>([]);
  const [unitsReady, setUnitsReady] = useState(false);
  const [values, setValues] = useState<BookingFormValues>({
    unitId: "",
    amenityId: "",
    start: "",
    end: "",
    guestCount: "1",
    notes: "",
  });
  const [errors, setErrors] = useState<BookingFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const now = useMemo(() => manilaNowLocal(), []);
  const maxStart = addDaysToLocal(now, 30);

  useEffect(() => {
    let cancelled = false;

    loadTenantUnits().then((result) => {
      if (cancelled) return;
      if (result.ok) {
        setUnits(result.units);
        setValues((current) => ({
          ...current,
          unitId: current.unitId || result.units[0] || "",
        }));
      } else {
        setFormError(unitsErrorMessage(result.error));
      }
      setUnitsReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  function update<K extends keyof BookingFormValues>(
    key: K,
    value: BookingFormValues[K],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateBooking(values, units);
    setErrors(nextErrors);
    setFormError(null);
    if (Object.keys(nextErrors).length > 0) return;

    setPending(true);
    try {
      const notes = values.notes.trim();
      const result = await createBooking({
        unitId: values.unitId.trim(),
        amenityId: values.amenityId,
        start: values.start,
        end: values.end,
        guestCount: Number.parseInt(values.guestCount, 10),
        ...(notes ? { notes } : {}),
      });

      if (result.kind === "unknown") {
        router.replace("/bookings?status=New&notice=check-list");
        return;
      }

      router.replace("/bookings?status=New&notice=created");
    } catch (caught) {
      if (caught instanceof UnauthenticatedError) {
        setFormError("Could not submit the booking. Please try again.");
      } else if (caught instanceof ApiError) {
        setFormError(userMessageForApiError(caught));
      } else {
        setFormError(
          "Could not submit the booking. Check your list before trying again.",
        );
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      {formError ? <Alert>{formError}</Alert> : null}

      <Field label="Unit" htmlFor="unitId" error={errors.unitId}>
        <select
          id="unitId"
          name="unitId"
          required
          disabled={!unitsReady || units.length === 0}
          value={values.unitId}
          onChange={(event) => update("unitId", event.target.value)}
          aria-invalid={Boolean(errors.unitId)}
          className={inputClassName}
        >
          {!unitsReady ? (
            <option value="">Loading units…</option>
          ) : units.length === 0 ? (
            <option value="">No units available</option>
          ) : (
            units.map((unit) => (
              <option key={unit} value={unit}>
                {unit}
              </option>
            ))
          )}
        </select>
      </Field>

      <Field label="Amenity" htmlFor="amenityId" error={errors.amenityId}>
        <select
          id="amenityId"
          name="amenityId"
          required
          value={values.amenityId}
          onChange={(event) => update("amenityId", event.target.value)}
          aria-invalid={Boolean(errors.amenityId)}
          className={inputClassName}
        >
          <option value="">Select an amenity</option>
          {AMENITY_IDS.map((id) => (
            <option key={id} value={id}>
              {AMENITIES[id].name}
            </option>
          ))}
        </select>
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Start"
          htmlFor="start"
          error={errors.start}
          hint="Philippines local time"
        >
          <input
            id="start"
            name="start"
            type="datetime-local"
            required
            min={now}
            max={maxStart}
            value={values.start}
            onChange={(event) =>
              update("start", event.target.value.slice(0, 16))
            }
            aria-invalid={Boolean(errors.start)}
            className={inputClassName}
          />
        </Field>
        <Field label="End" htmlFor="end" error={errors.end}>
          <input
            id="end"
            name="end"
            type="datetime-local"
            required
            min={values.start || now}
            value={values.end}
            onChange={(event) => update("end", event.target.value.slice(0, 16))}
            aria-invalid={Boolean(errors.end)}
            className={inputClassName}
          />
        </Field>
      </div>

      <Field
        label="Guest count"
        htmlFor="guestCount"
        error={errors.guestCount}
      >
        <input
          id="guestCount"
          name="guestCount"
          type="number"
          min={0}
          max={99}
          required
          value={values.guestCount}
          onChange={(event) => update("guestCount", event.target.value)}
          aria-invalid={Boolean(errors.guestCount)}
          className={inputClassName}
        />
      </Field>

      <Field
        label="Notes (optional)"
        htmlFor="notes"
        error={errors.notes}
        hint={`${values.notes.trim().length}/200`}
      >
        <textarea
          id="notes"
          name="notes"
          rows={3}
          maxLength={200}
          value={values.notes}
          onChange={(event) => update("notes", event.target.value)}
          aria-invalid={Boolean(errors.notes)}
          className={inputClassName}
        />
      </Field>

      <Button type="submit" disabled={pending || !unitsReady || units.length === 0}>
        {pending ? "Submitting…" : "Submit booking"}
      </Button>
    </form>
  );
}
