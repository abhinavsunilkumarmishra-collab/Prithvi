import Link from 'next/link'
import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import {
  getPlotById,
  plots,
  landTypeLabels,
  verificationLabels,
  type LoanStatus,
  type DisputeStatus,
} from '@/lib/plots'
import { StatusBadge } from '@/components/status-badge'
import { SaleSimulationPanel } from '@/components/sale-simulation-panel'
import { PriceEstimatePanel } from '@/components/price-estimate-panel'
import { ROLE_COOKIE, isRole, canViewFraudDetails } from '@/lib/auth'

export function generateStaticParams() {
  return plots.map((p) => ({ id: p.id }))
}

const LOAN_TONE: Record<LoanStatus, 'good' | 'warn' | 'bad'> = {
  active: 'warn',
  closed: 'good',
  defaulted: 'bad',
}

const DISPUTE_TONE: Record<DisputeStatus, 'good' | 'warn' | 'bad'> = {
  resolved: 'good',
  under_hearing: 'warn',
  open: 'bad',
}

function formatInr(amount: number) {
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(amount)
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default async function PlotDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const plot = getPlotById(id)

  if (!plot) {
    notFound()
  }

  const cookieStore = await cookies()
  const roleValue = cookieStore.get(ROLE_COOKIE)?.value
  const role = isRole(roleValue) ? roleValue : null
  const showFraudDetails = canViewFraudDetails(role)

  const verificationTone = plot.verificationStatus === 'verified' ? 'good' : plot.verificationStatus === 'pending' ? 'neutral' : 'bad'

  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-card/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Map
          </Link>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
              <svg viewBox="0 0 24 24" className="h-4 w-4 text-primary-foreground" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <path d="M12 3 4 7v10l8 4 8-4V7l-8-4Z" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-sm font-bold tracking-tight">PRTHVI</span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
        {/* Title block */}
        <section className="mb-6">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs text-muted-foreground">{plot.id}</span>
            <StatusBadge label={verificationLabels[plot.verificationStatus]} tone={verificationTone} />
            <StatusBadge label={landTypeLabels[plot.landType]} tone="neutral" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{plot.surveyNumber}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {plot.village}, {plot.ward} &middot; {plot.taluka}, {plot.district}, {plot.state}
          </p>
        </section>

        {/* Land details */}
        <section className="mb-5 rounded-lg border border-border bg-card p-4 sm:p-5">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Parcel details</h2>
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <dt className="text-xs text-muted-foreground">Land use</dt>
              <dd className="mt-0.5 text-sm font-medium text-foreground">{landTypeLabels[plot.landType]}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Area</dt>
              <dd className="mt-0.5 font-mono text-sm font-medium text-foreground">{plot.areaSqM.toLocaleString('en-IN')} sq.m</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Gat / Survey No.</dt>
              <dd className="mt-0.5 font-mono text-sm font-medium text-foreground">{plot.gatNumber}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Last verified</dt>
              <dd className="mt-0.5 font-mono text-sm font-medium text-foreground">{formatDate(plot.lastVerified)}</dd>
            </div>
          </dl>
        </section>

        {/* Market rate estimate */}
        <PriceEstimatePanel village={plot.village} areaSqM={plot.areaSqM} />

        {/* Ownership */}
        <section className="mb-5 rounded-lg border border-border bg-card p-4 sm:p-5">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Ownership record</h2>
          <div className="mb-4 flex items-start justify-between gap-3 rounded-md bg-secondary p-3">
            <div>
              <p className="text-xs text-muted-foreground">Current owner</p>
              <p className="mt-0.5 text-base font-semibold text-foreground">{plot.currentOwner.name}</p>
              <p className="text-xs text-muted-foreground">{plot.currentOwner.relation}</p>
            </div>
            <span className="whitespace-nowrap font-mono text-xs text-muted-foreground">since {formatDate(plot.currentOwner.from)}</span>
          </div>
          {plot.previousOwners.length > 0 ? (
            <div>
              <p className="mb-2 text-xs text-muted-foreground">Previous owner(s)</p>
              <ul className="flex flex-col gap-2">
                {plot.previousOwners.map((owner, idx) => (
                  <li key={idx} className="flex items-start justify-between gap-3 border-t border-border pt-2 text-sm">
                    <div>
                      <p className="font-medium text-foreground">{owner.name}</p>
                      <p className="text-xs text-muted-foreground">{owner.relation}</p>
                    </div>
                    <span className="whitespace-nowrap font-mono text-xs text-muted-foreground">
                      {formatDate(owner.from)} &ndash; {owner.to ? formatDate(owner.to) : 'present'}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No prior transfer on record.</p>
          )}
        </section>

        {/* Fraud risk — role gated */}
        {plot.fraudFlags.length > 0 && (
          <section className="mb-5 rounded-lg border border-status-bad/40 bg-status-bad/5 p-4 sm:p-5">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-status-bad">
              Fraud risk assessment
            </h2>
            {showFraudDetails ? (
              <ul className="flex flex-col gap-3">
                {plot.fraudFlags.map((flag, idx) => (
                  <li key={idx} className="rounded-md border border-border bg-card p-3">
                    <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-foreground">{flag.title}</span>
                      <StatusBadge label={flag.severity} tone={flag.severity === 'high' ? 'bad' : 'warn'} />
                    </div>
                    <p className="text-sm text-muted-foreground">{flag.description}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="rounded-md border border-dashed border-border bg-card p-3">
                <p className="text-sm text-foreground">
                  This parcel has been flagged for review. Detailed fraud-pattern findings are only
                  visible to verifying banks and land revenue officers.
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Sign in as a Bank Officer or Land Revenue Officer to view the full assessment.
                </p>
              </div>
            )}
          </section>
        )}

        {/* Sale & owner confirmation simulation */}
        <SaleSimulationPanel ownerName={plot.currentOwner.name} ownerPhone={plot.ownerPhone} />

        {/* Loan */}
        <section className="mb-5 rounded-lg border border-border bg-card p-4 sm:p-5">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Loan / encumbrance</h2>
          {plot.loan ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-base font-semibold text-foreground">{plot.loan.lender}</p>
                <StatusBadge label={plot.loan.status} tone={LOAN_TONE[plot.loan.status]} />
              </div>
              <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <div>
                  <dt className="text-xs text-muted-foreground">Amount sanctioned</dt>
                  <dd className="mt-0.5 font-mono text-sm font-medium text-foreground">Rs. {formatInr(plot.loan.amountInr)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Sanctioned on</dt>
                  <dd className="mt-0.5 font-mono text-sm font-medium text-foreground">{formatDate(plot.loan.sanctionedDate)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Account reference</dt>
                  <dd className="mt-0.5 font-mono text-sm font-medium text-foreground">{plot.loan.accountRef}</dd>
                </div>
              </dl>
            </div>
          ) : (
            <p className="text-sm text-status-good">No active loan or mortgage recorded on this parcel.</p>
          )}
        </section>

        {/* Disputes */}
        <section className="mb-5 rounded-lg border border-border bg-card p-4 sm:p-5">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Legal disputes</h2>
          {plot.disputes.length > 0 ? (
            <ul className="flex flex-col gap-3">
              {plot.disputes.map((dispute) => (
                <li key={dispute.caseNumber} className="rounded-md border border-border p-3">
                  <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
                    <span className="font-mono text-xs font-medium text-foreground">{dispute.caseNumber}</span>
                    <StatusBadge label={dispute.status.replace('_', ' ')} tone={DISPUTE_TONE[dispute.status]} />
                  </div>
                  <p className="text-sm text-foreground">{dispute.description}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {dispute.court} &middot; Filed {formatDate(dispute.filedDate)}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-status-good">No open cases or disputes recorded on this parcel.</p>
          )}
        </section>

        {/* Source / audit trail */}
        <section className="rounded-lg border border-dashed border-border p-4 text-xs text-muted-foreground sm:p-5">
          <p className="font-medium text-foreground">Verification note</p>
          <p className="mt-1">{plot.sourceNote}</p>
          <p className="mt-3 border-t border-border pt-3">
            This is a prototype screen. Owner names, loan accounts and case numbers are synthetic demo data for
            illustration only and do not represent real persons, institutions or legal proceedings.
          </p>
        </section>
      </div>
    </main>
  )
}
