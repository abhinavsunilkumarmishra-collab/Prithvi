// PRTHVI — prototype land-record dataset
// All owner names, loan accounts, and case numbers below are SYNTHETIC placeholder
// data generated for demo purposes only. Parcel geometry is approximated (small
// grid-placed rectangles, jittered) for a ward-scale area in Nagpur and is
// illustrative, not a survey-accurate cadastral map.
// This dataset does not represent real persons, real loans, or real legal cases.
//
// The actual plot records now live in data/plots-data.json, which is the
// "backend" file. An Excel workbook (owner-land-loan-backend.xlsx) mirrors
// that same data in spreadsheet form for easy editing — see
// scripts/README.md for how the two stay in sync.

import rawData from "@/data/plots-data.json"

export type LandType = "residential" | "commercial" | "agricultural"
export type VerificationStatus = "verified" | "pending" | "flagged"
export type LoanStatus = "active" | "closed" | "defaulted"
export type DisputeStatus = "open" | "under_hearing" | "resolved"

export interface OwnershipRecord {
  name: string
  relation?: string
  from: string
  to?: string
}

export interface LoanRecord {
  lender: string
  accountRef: string
  amountInr: number
  sanctionedDate: string
  status: LoanStatus
}

export interface DisputeRecord {
  caseNumber: string
  court: string
  filedDate: string
  status: DisputeStatus
  description: string
}

export type FraudFlagType =
  | "duplicate_ownership_claim"
  | "loan_after_ownership_change"
  | "owner_absence_reported"
  | "impersonation_suspected"

export interface FraudFlag {
  type: FraudFlagType
  title: string
  description: string
  severity: "medium" | "high"
}

export interface LandPlot {
  id: string
  surveyNumber: string
  gatNumber: string
  village: string
  ward: string
  taluka: string
  district: string
  state: string
  landType: LandType
  areaSqM: number
  coordinates: [number, number][]
  centroid: [number, number]
  currentOwner: OwnershipRecord
  previousOwners: OwnershipRecord[]
  loan: LoanRecord | null
  disputes: DisputeRecord[]
  verificationStatus: VerificationStatus
  lastVerified: string
  sourceNote: string
  fraudFlags: FraudFlag[]
  ownerPhone: string
}

// Approximate center: Dharampeth ward, Nagpur, Maharashtra
export const MAP_CENTER: [number, number] = [21.1414, 79.0698]
export const WARD_NAME = "Dharampeth Ward"
export const DISTRICT_NAME = "Nagpur"
export const STATE_NAME = "Maharashtra"

// ---- Data now comes from the editable JSON backend file ----
export const plots: LandPlot[] = rawData as LandPlot[]

export function getPlotById(id: string): LandPlot | undefined {
  return plots.find((p) => p.id === id)
}

export const landTypeLabels: Record<LandType, string> = {
  residential: "Residential",
  commercial: "Commercial",
  agricultural: "Agricultural",
}

export const verificationLabels: Record<VerificationStatus, string> = {
  verified: "Verified",
  pending: "Pending re-verification",
  flagged: "Flagged",
}
