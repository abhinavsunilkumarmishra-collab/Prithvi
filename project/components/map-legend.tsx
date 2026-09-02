const ITEMS = [
  { label: 'Residential', color: '#3c6690' },
  { label: 'Commercial', color: '#d6a441' },
  { label: 'Agricultural', color: '#4c9473' },
]

export function MapLegend() {
  return (
    <div className="pointer-events-auto flex flex-col gap-2 rounded-md border border-border bg-card/95 px-3 py-2.5 shadow-lg backdrop-blur-sm">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        Land use
      </span>
      <div className="flex flex-col gap-1.5">
        {ITEMS.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-sm border"
              style={{ backgroundColor: item.color, borderColor: item.color, opacity: 0.85 }}
              aria-hidden="true"
            />
            <span className="text-xs text-foreground">{item.label}</span>
          </div>
        ))}
        <div className="mt-1 flex items-center gap-2 border-t border-border pt-1.5">
          <span
            className="h-2.5 w-2.5 rounded-sm border-2"
            style={{ borderColor: '#b8402f', borderStyle: 'dashed', backgroundColor: 'transparent' }}
            aria-hidden="true"
          />
          <span className="text-xs text-foreground">Flagged / disputed</span>
        </div>
      </div>
    </div>
  )
}
