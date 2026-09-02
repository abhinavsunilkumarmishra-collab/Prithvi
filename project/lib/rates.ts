// Market rate reference table — per sq.ft. price RANGE by village/ward.
//
// This is an editable lookup, not a live government API: there is no public
// real-time API for market land rates. These are locality-average ranges you
// supply (e.g. from local broker/Google-sourced estimates). Keep this table
// updated manually or swap it for a JSON/DB-backed source later — the shape
// stays the same either way.
//
// Rates are in INR per square foot. Add one entry per village/ward you have
// data for. `fallback` is used for any plot whose village isn't listed yet,
// so the UI never breaks — it just shows an "estimate unavailable" state.

export interface RateRange {
  minPerSqFt: number
  maxPerSqFt: number
  /** Short note on where this range comes from, shown to the user for transparency. */
  source: string
  /** ISO date this range was last updated by whoever maintains the table. */
  asOf: string
}

export const VILLAGE_RATES: Record<string, RateRange> = {
  Dharampeth: {
    minPerSqFt: 6923,
    maxPerSqFt: 11059,
    source: "Locality average (govt. ready-reckoner + market listings)",
    asOf: "2026-01-01",
  },
}

const SQM_TO_SQFT = 10.7639

export function sqmToSqft(areaSqM: number): number {
  return areaSqM * SQM_TO_SQFT
}

export function getRateForVillage(village: string): RateRange | null {
  return VILLAGE_RATES[village] ?? null
}

export interface PriceEstimate {
  rate: RateRange
  areaSqFt: number
  minTotalInr: number
  maxTotalInr: number
}

export function estimatePrice(village: string, areaSqM: number): PriceEstimate | null {
  const rate = getRateForVillage(village)
  if (!rate) return null

  const areaSqFt = sqmToSqft(areaSqM)
  return {
    rate,
    areaSqFt,
    minTotalInr: rate.minPerSqFt * areaSqFt,
    maxTotalInr: rate.maxPerSqFt * areaSqFt,
  }
}

/**
 * Formats a rupee amount into the Indian Lakh/Crore convention used for
 * property prices, e.g. 8308000 -> "83.08 Lakh", 133000000 -> "1.33 Crore".
 */
export function formatInrCompact(amount: number): string {
  const crore = 1_00_00_000
  const lakh = 1_00_000

  if (amount >= crore) {
    return `${(amount / crore).toLocaleString("en-IN", { maximumFractionDigits: 2 })} Crore`
  }
  if (amount >= lakh) {
    return `${(amount / lakh).toLocaleString("en-IN", { maximumFractionDigits: 2 })} Lakh`
  }
  return `Rs. ${amount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`
}
