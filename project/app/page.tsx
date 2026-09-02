import { cookies } from 'next/headers'
import { MapShell } from '@/components/map-shell'
import { WARD_NAME, DISTRICT_NAME, STATE_NAME, plots } from '@/lib/plots'
import { ROLE_COOKIE, ROLE_LABELS, isRole } from '@/lib/auth'
import { LogoutButton } from '@/components/logout-button'

export default async function Page() {
  const flaggedCount = plots.filter((p) => p.verificationStatus === 'flagged').length
  const cookieStore = await cookies()
  const roleValue = cookieStore.get(ROLE_COOKIE)?.value
  const role = isRole(roleValue) ? roleValue : null

  return (
    <main className="flex h-screen flex-col bg-background">
      <header className="z-[500] flex flex-wrap items-center justify-between gap-3 border-b border-border bg-card px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary">
            <svg viewBox="0 0 24 24" className="h-5 w-5 text-primary-foreground" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <path d="M12 3 4 7v10l8 4 8-4V7l-8-4Z" strokeLinejoin="round" />
              <path d="M12 3v18" strokeLinejoin="round" />
              <path d="M4 7l8 4 8-4" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <h1 className="text-base font-bold leading-none tracking-tight text-foreground sm:text-lg">PRTHVI</h1>
            <p className="text-[11px] leading-none text-muted-foreground">Land Record Verification Prototype</p>
          </div>
        </div>
        <div className="flex items-center gap-4 font-mono text-xs">
          <div className="hidden flex-col text-right sm:flex">
            <span className="text-foreground">{WARD_NAME}</span>
            <span className="text-muted-foreground">{DISTRICT_NAME}, {STATE_NAME}</span>
          </div>
          {role && (
            <div className="flex items-center gap-2 border-l border-border pl-4">
              <div className="flex flex-col text-right leading-tight">
                <span className="text-[10px] text-muted-foreground">Viewing as</span>
                <span className="text-foreground">{ROLE_LABELS[role]}</span>
              </div>
              <LogoutButton />
            </div>
          )}
          <div className="flex items-center gap-1.5 rounded-md border border-status-bad/40 bg-status-bad/10 px-2 py-1 text-status-bad">
            <span className="h-1.5 w-1.5 rounded-full bg-status-bad" aria-hidden="true" />
            {flaggedCount} flagged
          </div>
        </div>
      </header>

      <div className="relative flex-1">
        <MapShell />
        <div className="pointer-events-none absolute top-3 right-3 z-[400] max-w-[220px] rounded-md border border-border bg-card/95 px-3 py-2.5 text-right shadow-lg backdrop-blur-sm sm:max-w-[260px]">
          <p className="text-[11px] leading-snug text-muted-foreground">
            Click any parcel to open its verified land record.
          </p>
        </div>
      </div>

      <footer className="z-[500] border-t border-border bg-card px-4 py-2 sm:px-6">
        <p className="text-[10px] leading-snug text-muted-foreground">
          Prototype only. Owners, loans and case numbers shown here are synthetic demo data, not real records.
        </p>
      </footer>
    </main>
  )
}
