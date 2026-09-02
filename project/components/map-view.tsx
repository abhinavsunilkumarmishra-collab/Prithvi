'use client'

import 'leaflet/dist/leaflet.css'
import { useRouter } from 'next/navigation'
import { MapContainer, TileLayer, Polygon, Tooltip } from 'react-leaflet'
import { MAP_CENTER, plots, type LandType } from '@/lib/plots'

const LAND_TYPE_COLOR: Record<LandType, string> = {
  residential: '#3c6690',
  commercial: '#d6a441',
  agricultural: '#4c9473',
}

const FLAGGED_COLOR = '#b8402f'

export function MapView() {
  const router = useRouter()

  return (
    <MapContainer
      center={MAP_CENTER}
      zoom={17}
      scrollWheelZoom
      zoomControl={false}
      className="h-full w-full"
      style={{ background: 'var(--background)' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {plots.map((plot) => {
        const isFlagged = plot.verificationStatus === 'flagged'
        const baseColor = LAND_TYPE_COLOR[plot.landType]
        return (
          <Polygon
            key={plot.id}
            positions={plot.coordinates}
            pathOptions={{
              color: isFlagged ? FLAGGED_COLOR : baseColor,
              weight: isFlagged ? 2.5 : 1.5,
              fillColor: baseColor,
              fillOpacity: 0.45,
              dashArray: isFlagged ? '4 3' : undefined,
            }}
            eventHandlers={{
              click: () => router.push(`/plot/${plot.id}`),
              mouseover: (e) => {
                e.target.setStyle({ fillOpacity: 0.72, weight: isFlagged ? 3 : 2.5 })
              },
              mouseout: (e) => {
                e.target.setStyle({ fillOpacity: 0.45, weight: isFlagged ? 2.5 : 1.5 })
              },
            }}
          >
            <Tooltip sticky direction="top" opacity={1} className="!rounded-md !border !border-border !bg-popover !px-2 !py-1 !font-mono !text-xs !text-popover-foreground !shadow-md">
              <div className="font-mono text-xs">
                <div className="font-semibold">{plot.id}</div>
                <div className="text-muted-foreground">{plot.surveyNumber}</div>
              </div>
            </Tooltip>
          </Polygon>
        )
      })}
    </MapContainer>
  )
}
