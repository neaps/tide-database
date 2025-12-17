import { basename, dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { readFile, writeFile, mkdir } from 'fs/promises'

const __dirname = dirname(fileURLToPath(import.meta.url))
const __tmpdir = join(__dirname, '..', 'tmp')

/**
 * Create a URL-safe slug from a station name
 */
export function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function indexBy(list, key) {
  list.reduce((acc, item) => {
    acc[item[key]] = item
    return acc
  }, {})
}
/**
 * Converts TICON-4 CSV files to station JSON format
 *
 * The script reads a TICON-4 CSV file and creates JSON files in the data/ directory
 * that conform to the station schema. Each unique station (by lat/lon/name) becomes
 * one JSON file with all its harmonic constituents aggregated.
 */
/**
 * Parse a CSV file
 */
export function parseCSV(content) {
  const lines = content.trim().split(/[\r\n]+/)
  const headers = lines[0].split(',')

  const rows = []
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',')
    const row = {}
    headers.forEach((header, index) => {
      row[header] = values[index]
    })
    rows.push(row)
  }

  return rows
}
