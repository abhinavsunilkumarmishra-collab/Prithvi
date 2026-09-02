// Generates the synthetic land-plot dataset as JSON.
// Mirrors the generation logic in project/lib/plots.ts, scaled to ~500 plots.
import fs from "fs"

const MAP_CENTER = [21.1414, 79.0698]
const WARD_NAME = "Dharampeth Ward"
const DISTRICT_NAME = "Nagpur"
const STATE_NAME = "Maharashtra"

function mulberry32(seed) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const rng = mulberry32(20250827)
function pick(arr) {
  return arr[Math.floor(rng() * arr.length)]
}
function randInt(min, max) {
  return Math.floor(rng() * (max - min + 1)) + min
}
function randDate(startYear, endYear) {
  const y = randInt(startYear, endYear)
  const m = randInt(1, 12)
  const d = randInt(1, 28)
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`
}

function centroidOf(coords) {
  const pts = coords.slice(0, -1)
  const lat = pts.reduce((s, p) => s + p[0], 0) / pts.length
  const lng = pts.reduce((s, p) => s + p[1], 0) / pts.length
  return [lat, lng]
}

function rectFromCenter(lat, lng, halfLat, halfLng) {
  return [
    [lat - halfLat, lng - halfLng],
    [lat - halfLat, lng + halfLng],
    [lat + halfLat, lng + halfLng],
    [lat + halfLat, lng - halfLng],
    [lat - halfLat, lng - halfLng],
  ]
}

const MALE_FIRST = ["Ravindra", "Sunil", "Nikhil", "Girish", "Abhijit", "Faisal", "Baliram", "Ashok", "Vinayak", "Suresh", "Prakash", "Sandeep", "Ganesh", "Vijay", "Ramesh", "Anil", "Yashwant", "Manoj", "Deepak", "Rajesh"]
const FEMALE_FIRST = ["Sunita", "Meera", "Pooja", "Kausalya", "Rekha", "Shalini", "Trupti", "Kavita", "Snehal", "Anjali", "Vaishali", "Sarika", "Nita", "Archana", "Priya", "Madhuri", "Seema", "Jyoti", "Rupali", "Swati"]
const SURNAMES = ["Deshmukh", "Kale", "Bhagat", "Choudhary", "Sheikh", "Bawane", "Rahangdale", "Mahure", "Naik", "Khadse", "Tembhurne", "Sahare", "Bhoyar", "Wankhede", "Ingle", "Gawande", "Meshram", "Thakre", "Raut", "Kadam", "More", "Pawar", "Shinde", "Joshi", "Kulkarni"]
const RELATIONS_M = ["Father", "Husband", "Grandfather"]
const RELATIONS_F = ["Wife", "Mother", "Daughter"]
const COMPANY_SUFFIX = ["Enterprises", "Traders", "Retail Ventures Pvt. Ltd.", "Associates", "Agro Industries", "Auto Spares", "Textiles"]
const COMPANY_PREFIX = ["Nagpur", "Orange City", "Vidarbha", "Maharaja", "Central India", "Reliable", "Shree", "New Era"]
const LENDERS = ["Bank of Maharashtra", "State Bank of India", "HDFC Bank", "ICICI Bank", "Kotak Mahindra Bank", "IDBI Bank", "Canara Bank", "IDFC First Bank", "Yes Bank", "Nagpur District Central Co-op Bank"]
const LENDER_CODE = {
  "Bank of Maharashtra": "BOM", "State Bank of India": "SBI", "HDFC Bank": "HDFC", "ICICI Bank": "ICICI",
  "Kotak Mahindra Bank": "KMB", "IDBI Bank": "IDBI", "Canara Bank": "CNRB", "IDFC First Bank": "IDFC",
  "Yes Bank": "YES", "Nagpur District Central Co-op Bank": "NDCC",
}
const COURTS = ["Civil Court, Nagpur", "Sub-Divisional Officer, Nagpur", "District Court, Nagpur"]
const DISPUTE_DESCRIPTIONS = [
  "Boundary encroachment claim filed by adjacent plot owner (demo record)",
  "Mutation entry objection by co-heir (demo record)",
  "Right-of-way access dispute with neighbouring property (demo record)",
  "Inheritance share dispute among family members (demo record)",
]
const FRAUD_FLAG_LIBRARY = {
  duplicate_ownership_claim: {
    title: "Duplicate ownership claim",
    description: "Two separate registration entries claim current ownership of this parcel within an overlapping period. One entry may be fraudulent (demo record).",
    severity: "high",
  },
  loan_after_ownership_change: {
    title: "Loan sanctioned right after ownership change",
    description: "A loan was sanctioned against this parcel within weeks of a recorded ownership transfer — a common pattern in fraudulent loan cases (demo record).",
    severity: "medium",
  },
  owner_absence_reported: {
    title: "Registered owner reported unavailable during transaction",
    description: "The registered owner was reportedly abroad or unreachable at the time this transaction was filed. Sale proceeded without owner's direct confirmation at the sub-registrar office (demo record).",
    severity: "high",
  },
  impersonation_suspected: {
    title: "Possible impersonation at registration",
    description: "Registration office records note the person present for signing could not be independently confirmed as the registered owner (e.g. photo/ID mismatch). Flagged for manual re-verification (demo record).",
    severity: "high",
  },
}
const SOURCE_NOTES = [
  "Cross-checked with 7/12 extract (demo record)",
  "Cross-checked with 7/12 and 8A extract (demo record)",
  "Cross-checked with registration office index (demo record)",
  "Mutation dispute resolved; record updated (demo record)",
  "Awaiting re-verification against latest mutation entry (demo record)",
]

function randomPersonName() {
  const isMale = rng() < 0.5
  const first = isMale ? pick(MALE_FIRST) : pick(FEMALE_FIRST)
  const middle = String.fromCharCode(65 + Math.floor(rng() * 26))
  const surname = pick(SURNAMES)
  return { name: `${first} ${middle}. ${surname}` }
}
function randomEntityName() {
  return `${pick(COMPANY_PREFIX)} ${pick(COMPANY_SUFFIX)}`
}

// ---- Scaled-up grid: target ~500 plots (was ~180) ----
const SCALE = Math.sqrt(576 / 195) // grow area so avg plot density/size stays similar
const LAT_SPAN_OLD = 21.1468 - 21.1360
const LNG_SPAN_OLD = 79.0745 - 79.0645
const LAT_SPAN = LAT_SPAN_OLD * SCALE
const LNG_SPAN = LNG_SPAN_OLD * SCALE
const LAT_MIN = MAP_CENTER[0] - LAT_SPAN / 2
const LAT_MAX = MAP_CENTER[0] + LAT_SPAN / 2
const LNG_MIN = MAP_CENTER[1] - LNG_SPAN / 2
const LNG_MAX = MAP_CENTER[1] + LNG_SPAN / 2
const COLS = 24
const ROWS = 24
const TOTAL_TARGET = 500

const METERS_PER_DEG_LAT = 111320
const metersPerDegLng = 111320 * Math.cos((MAP_CENTER[0] * Math.PI) / 180)

const cellLat = (LAT_MAX - LAT_MIN) / ROWS
const cellLng = (LNG_MAX - LNG_MIN) / COLS

const rawPlots = []
let count = 0
outer: for (let r = 0; r < ROWS; r++) {
  for (let c = 0; c < COLS; c++) {
    if (count >= TOTAL_TARGET) break outer
    if (rng() < 0.12) continue

    const cellCenterLat = LAT_MIN + cellLat * (r + 0.5)
    const cellCenterLng = LNG_MIN + cellLng * (c + 0.5)
    const jitterLat = (rng() - 0.5) * cellLat * 0.5
    const jitterLng = (rng() - 0.5) * cellLng * 0.5
    const centerLat = cellCenterLat + jitterLat
    const centerLng = cellCenterLng + jitterLng

    const typeRoll = rng()
    const landType = typeRoll < 0.55 ? "residential" : typeRoll < 0.8 ? "commercial" : "agricultural"

    let areaSqM
    if (landType === "residential") areaSqM = randInt(220, 480)
    else if (landType === "commercial") areaSqM = randInt(380, 950)
    else areaSqM = randInt(2200, 5200)

    const sideM = Math.sqrt(areaSqM)
    const halfLat = Math.min(sideM / 2 / METERS_PER_DEG_LAT, cellLat * 0.42)
    const halfLng = Math.min(sideM / 2 / metersPerDegLng, cellLng * 0.42)

    const blockNo = 40 + Math.floor(count / 6)
    const subNo = (count % 6) + 1
    const surveyNumber = `Survey No. ${blockNo}/${subNo}`
    const gatNumber = `Gat ${blockNo}`

    const isEntity = landType !== "residential" && rng() < 0.5
    const currentOwner = isEntity
      ? { name: randomEntityName(), relation: "Registered entity", from: randDate(2005, 2023) }
      : (() => {
          const p = randomPersonName()
          return { ...p, relation: "Self", from: randDate(2005, 2023) }
        })()

    const hasPrevOwner = !isEntity && rng() < 0.45
    const previousOwners = []
    if (hasPrevOwner) {
      const p = randomPersonName()
      const relation = rng() < 0.5 ? pick(RELATIONS_M) : pick(RELATIONS_F)
      previousOwners.push({ ...p, relation, from: randDate(1975, 2004), to: currentOwner.from })
    }

    const hasLoan = rng() < 0.5
    const loan = hasLoan
      ? (() => {
          const lender = pick(LENDERS)
          const code = LENDER_CODE[lender]
          const status = rng() < 0.75 ? "active" : rng() < 0.9 ? "closed" : "defaulted"
          return {
            lender,
            accountRef: `${code}/${landType === "commercial" ? "CC" : "HL"}/${randInt(2015, 2023)}/${String(randInt(100, 9999)).padStart(5, "0")}`,
            amountInr: landType === "agricultural" ? randInt(150000, 900000) : landType === "commercial" ? randInt(1500000, 8000000) : randInt(800000, 3200000),
            sanctionedDate: randDate(2015, 2024),
            status,
          }
        })()
      : null

    const verRoll = rng()
    const verificationStatus = verRoll < 0.8 ? "verified" : verRoll < 0.92 ? "pending" : "flagged"

    const hasDispute = verificationStatus === "flagged" || rng() < 0.06
    const disputes = hasDispute
      ? [
          {
            caseNumber: `${rng() < 0.5 ? "RCS" : "MRT"}/${randInt(2020, 2025)}/${String(randInt(1, 999)).padStart(4, "0")}`,
            court: pick(COURTS),
            filedDate: randDate(2020, 2025),
            status: verificationStatus === "flagged" ? "under_hearing" : pick(["resolved", "under_hearing", "open"]),
            description: pick(DISPUTE_DESCRIPTIONS),
          },
        ]
      : []

    const fraudFlags = []
    if (verificationStatus === "flagged") {
      const flagCount = rng() < 0.4 ? 2 : 1
      const availableTypes = ["duplicate_ownership_claim", "loan_after_ownership_change", "owner_absence_reported", "impersonation_suspected"]
      const chosen = new Set()
      while (chosen.size < flagCount) chosen.add(pick(availableTypes))
      for (const t of chosen) fraudFlags.push({ type: t, ...FRAUD_FLAG_LIBRARY[t] })
    } else if (verificationStatus === "pending" && rng() < 0.15) {
      fraudFlags.push({ type: "loan_after_ownership_change", ...FRAUD_FLAG_LIBRARY.loan_after_ownership_change })
    }

    const ownerPhone = `+91 ${randInt(70, 99)}${randInt(100, 999)} ${randInt(10000, 99999)}`

    rawPlots.push({
      surveyNumber, gatNumber,
      village: "Dharampeth", ward: WARD_NAME, taluka: "Nagpur Urban", district: DISTRICT_NAME, state: STATE_NAME,
      landType, areaSqM,
      coordinates: rectFromCenter(centerLat, centerLng, halfLat, halfLng),
      currentOwner, previousOwners, loan, disputes,
      verificationStatus, lastVerified: randDate(2025, 2025), sourceNote: pick(SOURCE_NOTES),
      fraudFlags, ownerPhone,
    })
    count++
  }
}

const plots = rawPlots.map((p, i) => ({
  ...p,
  id: `NGP-DHR-${String(i + 1).padStart(3, "0")}`,
  centroid: centroidOf(p.coordinates),
}))

fs.writeFileSync("/home/claude/land-registry/project/data/plots-data.json", JSON.stringify(plots, null, 2))
console.log(`Generated ${plots.length} plots.`)
console.log(`Bounds: lat ${LAT_MIN.toFixed(4)}-${LAT_MAX.toFixed(4)}, lng ${LNG_MIN.toFixed(4)}-${LNG_MAX.toFixed(4)}`)
