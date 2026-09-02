'use client'

import dynamic from 'next/dynamic'
import { MapLegend } from '@/components/map-legend'

const MapView = dynamic(() => import('@/components/map-view').then((m) => m.MapView), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-muted">
      <span className="font-mono text-xs text-muted-foreground">Loading parcel map…</span>
    </div>
  ),
})

export function MapShell() {
  return (
    <div className="relative h-full w-full">
      <MapView />
      <div className="pointer-events-none absolute bottom-3 left-3 z-[400]">
        <MapLegend />
      </div>
    </div>
  )
}
