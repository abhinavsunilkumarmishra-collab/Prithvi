import { StatusBadge } from "@/components/status-badge"
import { estimatePrice, formatInrCompact } from "@/lib/rates"

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
}

export function PriceEstimatePanel({ village, areaSqM }: { village: string; areaSqM: number }) {
  const estimate = estimatePrice(village, areaSqM)

  return (
    <section className="mb-5 rounded-lg border border-border bg-card p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Estimated market rate
        </h2>
        {estimate ? (
          <StatusBadge label="Locality estimate" tone="neutral" />
        ) : (
          <StatusBadge label="No rate data" tone="neutral" />
        )}
      </div>

      {estimate ? (
        <div className="flex flex-col gap-4">
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs text-muted-foreground">Rate per sq.ft. ({village})</dt>
              <dd className="mt-0.5 font-mono text-sm font-medium text-foreground">
                Rs. {estimate.rate.minPerSqFt.toLocaleString("en-IN")} &ndash; Rs.{" "}
                {estimate.rate.maxPerSqFt.toLocaleString("en-IN")} / sq.ft
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Parcel area</dt>
              <dd className="mt-0.5 font-mono text-sm font-medium text-foreground">
                {estimate.areaSqFt.toLocaleString("en-IN", { maximumFractionDigits: 0 })} sq.ft
              </dd>
            </div>
          </dl>

          <div className="rounded-md bg-secondary p-3">
            <p className="text-xs text-muted-foreground">Estimated total value</p>
            <p className="mt-0.5 text-lg font-semibold text-foreground">
              {formatInrCompact(estimate.minTotalInr)} &ndash; {formatInrCompact(estimate.maxTotalInr)}
            </p>
          </div>

          <p className="text-xs text-muted-foreground">
            Source: {estimate.rate.source}. Last updated {formatDate(estimate.rate.asOf)}. This is a locality-level
            estimate for reference only &mdash; it is not an official government valuation and should not be used
            in place of a registered valuer&apos;s report or the state Ready Reckoner rate for stamp duty purposes.
          </p>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          No market rate data has been added for {village} yet. Rates are added manually per locality &mdash; add an
          entry to <code className="font-mono text-xs">lib/rates.ts</code> to enable this for the area.
        </p>
      )}
    </section>
  )
}
