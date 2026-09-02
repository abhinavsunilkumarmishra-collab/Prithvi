import { cn } from '@/lib/utils'

type Tone = 'good' | 'warn' | 'bad' | 'neutral'

const TONE_CLASS: Record<Tone, string> = {
  good: 'bg-status-good/12 text-status-good border-status-good/35',
  warn: 'bg-status-warn/15 text-status-warn border-status-warn/40',
  bad: 'bg-status-bad/12 text-status-bad border-status-bad/35',
  neutral: 'bg-muted text-muted-foreground border-border',
}

export function StatusBadge({
  label,
  tone,
  className,
}: {
  label: string
  tone: Tone
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border px-2 py-1 font-mono text-[11px] font-medium uppercase tracking-wide',
        TONE_CLASS[tone],
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {label}
    </span>
  )
}
