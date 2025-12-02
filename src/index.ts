type HarmonicConstituent = {
  name: string
  description?: string
  amplitude: number
  phase_UTC: number
  phase_local: number
  speed?: number
}

export interface Station {
  // Basic station information
  id: string
  name: string
  continent: string
  country: string
  region: string
  timezone: string
  disclaimers: string
  restriction: string
  type: 'reference' | 'secondary'
  latitude: number
  longitude: number

  // Data source information
  source: {
    name: string
    id: string
    published_harmonics: boolean
    url: string
    source_url: string
  }

  // License information
  license: {
    type: string
    commercial_use: boolean
    url: string
    notes?: string
  }

  // Harmonic constituents (empty array for secondary stations)
  harmonic_constituents: HarmonicConstituent[]

  // Secondary station offsets (empty object for reference stations)
  secondary_offset?: {
    reference_station: string
    height_offset: { high: number; low: number }
    time_offset: { high: number; low: number }
  }
}

const stations: Station[] = Object.values(
  import.meta.glob('../data/**/*.json', { eager: true, import: 'default' })
)

export default stations
