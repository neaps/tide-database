#!/usr/bin/env node

import { writeFileSync, mkdirSync } from 'fs'
import { readFile } from 'fs/promises'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { find as findTz } from 'geo-tz/all'
import { parseCSV, slugify } from './util.js'
import lookup from 'country-code-lookup'

const __dirname = dirname(fileURLToPath(import.meta.url))
const metaPath = join(__dirname, '..', 'tmp', 'TICON-4', 'meta.csv')
const dataPath = join(__dirname, '..', 'tmp', 'TICON-4', 'data.csv')

/**
 * Converts TICON-4 CSV files to station JSON format
 *
 * The script reads a TICON-4 CSV file and creates JSON files in the data/ directory
 * that conform to the station schema. Each unique station (by lat/lon/name) becomes
 * one JSON file with all its harmonic constituents aggregated.
 */
async function main() {
  const metadata = parseCSV(await readFile(metaPath, 'utf-8'))
  const data = await readFile(dataPath, 'utf-8')
  const stations = groupByStation(parseCSV(data))

  let created = 0

  for (const station of stations) {
    const stationJson = convertStation(station)
    const { iso2 } = lookup.byIso(station.metadata.country)
    const slug = slugify(station.metadata.tide_gauge_name)

    // Create path: data/{country}/{slug}.json
    const directory = join(__dirname, '..', 'data', iso2.toLowerCase())
    const filePath = join(directory, `${slug}.json`)

    // Create directory if it doesn't exist
    mkdirSync(directory, { recursive: true })

    // Write the JSON file
    writeFileSync(filePath, JSON.stringify(stationJson, null, 2) + '\n')
    created++

    process.stdout.write('.')
  }

  console.log(`\nDone. Created ${created} files`)
}

/**
 * Group rows by station (unique lat/lon/name combination)
 */
function groupByStation(rows) {
  const stations = new Map()

  for (const row of rows) {
    const key = row.tide_gauge_name

    if (!stations.has(key)) {
      stations.set(key, {
        metadata: {
          lat: parseFloat(row.lat),
          lon: parseFloat(row.lon),
          tide_gauge_name: row.tide_gauge_name,
          type: row.type,
          country: row.country,
          gesla_source: row.gesla_source,
          record_quality: row.record_quality,
          datum_information: row.datum_information,
          years_of_obs: parseFloat(row.years_of_obs),
          start_date: row.start_date,
          end_date: row.end_date,
        },
        constituents: [],
      })
    }

    // Add this constituent
    stations.get(key).constituents.push({
      name: row.con,
      amplitude: parseFloat(row.amp),
      phase_UTC: parseFloat(row.pha),
      amplitude_std: parseFloat(row.amp_std),
      phase_std: parseFloat(row.pha_std),
      missing_obs: parseFloat(row.missing_obs),
      no_of_obs: parseInt(row.no_of_obs),
    })
  }

  return Array.from(stations.values())
}

/**
 * Convert a TICON-4 station to our JSON schema format
 */
function convertStation(station) {
  const { metadata, constituents } = station
  const { continent, country } = lookup.byIso(metadata.country)

  // Create the station JSON
  const stationJson = {
    id: slugify(metadata.tide_gauge_name),
    name: metadata.tide_gauge_name,
    continent,
    country,
    latitude: metadata.lat,
    longitude: metadata.lon,
    type: 'reference',
    timezone: findTz(metadata.lat, metadata.lon)[0],
    disclaimers: metadata.record_quality,
    source: {
      name: 'TICON-4',
      url: 'https://www.seanoe.org/data/00980/109129/',
      id: metadata.tide_gauge_name,
      datum: metadata.datum_information,
      observation_period: {
        start: metadata.start_date,
        end: metadata.end_date,
        years: metadata.years_of_obs,
      },
    },
    license: {
      name: 'cc-by-4.0',
      url: 'https://creativecommons.org/licenses/by/4.0/',
    },
    harmonic_constituents: constituents.map((c) => ({
      name: c.name,
      amplitude: c.amplitude,
      phase_UTC: c.phase_UTC,
      // metadata: {
      //   amplitude_std: c.amplitude_std,
      //   phase_std: c.phase_std,
      //   missing_obs: c.missing_obs,
      //   no_of_obs: c.no_of_obs,
      // },
    })),
    secondary_offset: null,
  }

  return stationJson
}

main()
