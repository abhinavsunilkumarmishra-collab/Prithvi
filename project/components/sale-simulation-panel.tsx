"use client"

import { useState } from "react"
import { StatusBadge } from "@/components/status-badge"

type SaleState = "idle" | "alert_sent" | "owner_confirmed" | "owner_disputed"

function maskPhone(phone: string) {
  // Show only the last 3 digits, mask the rest — e.g. +91 98765 43210 -> +91 XXXXX XX210
  const digitsOnly = phone.replace(/\D/g, "")
  const last3 = digitsOnly.slice(-3)
  return `+91 XXXXX XX${last3}`
}

export function SaleSimulationPanel({ ownerName, ownerPhone }: { ownerName: string; ownerPhone: string }) {
  const [state, setState] = useState<SaleState>("idle")

  return (
    <section className="mb-5 rounded-lg border border-border bg-card p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Sale &amp; owner confirmation
        </h2>
        {state === "idle" && <StatusBadge label="No sale in progress" tone="neutral" />}
        {state === "alert_sent" && <StatusBadge label="Awaiting owner response" tone="warn" />}
        {state === "owner_confirmed" && <StatusBadge label="Owner confirmed" tone="good" />}
        {state === "owner_disputed" && <StatusBadge label="Owner disputes this sale" tone="bad" />}
      </div>

      {state === "idle" && (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            Demo action: simulate a buyer initiating a purchase on this parcel. In a real deployment, this
            would trigger an alert to the registered owner&apos;s verified contact on file &mdash; independent
            of whoever is filing the sale &mdash; before the transaction is allowed to proceed.
          </p>
          <button
            onClick={() => setState("alert_sent")}
            className="w-fit rounded-md bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Simulate: Initiate sale on this parcel
          </button>
        </div>
      )}

      {state === "alert_sent" && (
        <div className="flex flex-col gap-3">
          <div className="rounded-md border border-status-warn/40 bg-status-warn/10 p-3">
            <p className="text-xs font-medium text-foreground">Alert sent (simulated SMS)</p>
            <p className="mt-1 text-sm text-foreground">
              &ldquo;A sale has been initiated on your land parcel by a third party. If this is not you,
              tap to report immediately.&rdquo;
            </p>
            <p className="mt-2 font-mono text-xs text-muted-foreground">
              Sent to registered owner {ownerName} &middot; {maskPhone(ownerPhone)}
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            Sale stays paused until the registered owner responds. Simulate the owner&apos;s response below:
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setState("owner_confirmed")}
              className="rounded-md border border-status-good/40 bg-status-good/10 px-3 py-2 text-xs font-semibold text-status-good transition-opacity hover:opacity-80"
            >
              Simulate: Owner confirms this sale
            </button>
            <button
              onClick={() => setState("owner_disputed")}
              className="rounded-md border border-status-bad/40 bg-status-bad/10 px-3 py-2 text-xs font-semibold text-status-bad transition-opacity hover:opacity-80"
            >
              Simulate: Owner reports &ldquo;this isn&apos;t me&rdquo;
            </button>
          </div>
        </div>
      )}

      {state === "owner_confirmed" && (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-status-good">
            Owner confirmed this transaction. Sale may proceed to registration.
          </p>
          <button
            onClick={() => setState("idle")}
            className="w-fit text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
          >
            Reset demo
          </button>
        </div>
      )}

      {state === "owner_disputed" && (
        <div className="flex flex-col gap-2">
          <div className="rounded-md border border-status-bad/40 bg-status-bad/10 p-3">
            <p className="text-sm font-medium text-status-bad">
              Owner reports they did not authorise this sale.
            </p>
            <p className="mt-1 text-xs text-foreground">
              Transaction automatically frozen. Case escalated to Land Revenue Officer for manual
              verification before registration can proceed.
            </p>
          </div>
          <button
            onClick={() => setState("idle")}
            className="w-fit text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
          >
            Reset demo
          </button>
        </div>
      )}
    </section>
  )
}
