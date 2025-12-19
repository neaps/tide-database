# Station files

Each tide station is defined in a single JSON file as defined by the schema in [../schemas/station.schema.json](../schemas/station.schema.json). This file includes basic station information, like location and name, harmonics, and subordinate station offsets. The files are a single JSON object.

Each station's ID is a slug of the name preceeded by the ISO country/region code of the station. For example, the station ID for Puerto Madryn, Chubut, Argentina, would be `ar-u-puerto-madryn`. The file names match these IDs.

## File structure

### Basic station data

The following fields define the basic station information:

- `id`: String - Unique station ID for this database only, in the format of `country-region-[slug of name]`
- `name`: String - Human-friendly name of station
- `country`: String - ISO 3166-1 alpha-3 country code
- `region`: String - ISO 3166-2 region code, if available. If not, whatever local postal codes
- `timezone`: String - IANA time zone code (e.g. `America/Los_Angeles`)
- `disclaimers`: String - Any disclaimers about using this data
- `type`: String - Either `reference` or `subordinate`. [More about station types](#station-types)
- `latitude`: Float - Latitude, in decimal degrees
- `longitude`: Float - Longitude, in decimal degrees

### Data source

The `source` object defines where the station's information came from, and whether that data was from published harmonics, or was derived from that organization's water level data

- `name`: String - Name of the source, i.e. `NOAA`
- `id`: String - The source's station ID
- `published_harmonics`: Boolean - Are the harmonics from published harmonic data? False means harmonics were computed
- `url`: String - URL to this station's data or information in the source's website
- `source_url`: String - URL to the source's homepage

### License information

The `license` object defines the license and whatever restrictions are placed on use of the data.

- `type`: String - A short description of the type of license (i.e. MIT, public domain, etc)
- `commercial_use`: Boolean - If `true` then there are no restrictions on commercial use
- `url`: String - A URL to the license information
- `notes`: String - Any additional restrictions or information on the license.

### Harmonic Constituents

If a station is a `reference` station, it needs to define all the harmonic constituents of the station in the field `harmonic_constituents`. If the station is a subordinate station, leave this as an empty array. It is an array of objects:

- `name`: String- Harmonic Constituent code (i.e. `M2`) - should be upper-case,
- `description`: String- Optional - name of constituent
- `amplitude`: Float - Amplitude
- `phase_UTC`: Float - Phase in UTC
- `phase_local`: Float - Phase for local timezone
- `speed`: Float - Angular speed (optional)

### Subordinate station offets

If a station is a `subordinate` station, then it should point to a reference station and provide offsets in a `offsets` field:

- `reference`: String - The ID of the reference station
- `height`: Object - Defines the values to add to water levels
  - `high`: Float - Height offset to add to the high tide (can be negative)
  - `low`: Float - Height offset to add to the low tide (can be negative)
- `time`: Object - Defines the time to add to when a high or low tide will occur
  - `high`: Float - Time offset, **in minutes**, to add to the high tide (can be negative)
  - `low`: Float - Time offset, **in minutes**, to add to the low tide (can be negative)

## <a name="station-types"/>Types of stations

Stations can either be _reference_ or _subordinate_, defined in the station's `type` field.

### Reference station

Reference stations have defined harmonic constituents. They should have an array of `harmonic_constituents`. These are usually stations that have a long selection of real water level observations.

### Subordinate station

Subordinate stations (commonly called "subordinate stations") are locations that have a very similar tides to a reference station. Usually these are geographically close to another reference station.

Subordinate stations have four kinds of offsets, two to correct for water level, and two for the time of high and low tide. They use an `offsets` object to define these items, along with the name of the reference station they are based on.
