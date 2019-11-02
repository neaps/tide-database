# Station files

Each tide station is defined in a single JSON file. This file includes basic station information, like location and name, harmonics, and secondary station offsets. The files are a single JSON object.

Each station's ID is a slug of the name preceeded by the country and region of the station. For example, the station ID for Puerto Madryn, Chubut, Argentina, would be `argentina-chubut-puerto-madryn`. The file names match these IDs.

## File structure

### Basic station data

The following fields define the basic station information:

- `id`: String - Unique station ID for this database only, in the format of `country-region-[slug of name]`
- `name`: String - Human-friendly name of station
- `continent`: String - One of `africa`, `antartica` `asia`, `australia`, `europe`, `north america`, `south america`
- `country`: String - ISO 3166-1 alpha-3 country code
- `region`: String - ISO 3166-2 region code, if available. If not, whatever local postal codes
- `timezone`: String - IANA time zone code (e.g. `America/Los_Angeles`)
- `disclamers`: String - Any disclamers about using this data
- `restriction`: String - Any restrictions on this data's use
- `type`: String - Either `reference` if it's a referene station, or `secondary` if it's a secondary station. [More about station types](#station-types)
- `latitude`: Float - Latitude, in decimal degrees
- `longitude`: Float - Longitude, in decimal degrees

### Data source

The `source` object defines where the station's information came from, and whether that data was from published harmonics, or was derived from that organization's water level data

- `name`: String - Name of the source, i.e. `NOAA`
- `id`: String - The source's station ID
- `published_harmonics`: Boolean - Are the harmonics from published harmonic data? False means harmonics were computed
- `license`: String - Short description of any terms or conditions on this data
- `url`: String - URL to this station's data or information in the source's website
- `source_url`: String - URL to the source's homepage

### Hamonic Constituents

If a station is a `reference` station, it needs to define all the harmonic constituents of the station in the field `harmonic_constituents`. If the station is a secondary station, leave this as an empty array. It is an array of objects:

- `name`: String- Harmonic Constituent code (i.e. `M2`) - should be upper-case,
- `description`: String- Optional - name of constituent
- `amplitude`: Float - Amplitude
- `phase_UTC`: Float - Phase in UTC
- `phase_local`: Float - Phase for local timezone
- `speed`: Float - Angular speed (optional)

### Secondary station offets

If a sation is a `secondary` station, then it should point to a reference station and provide offsets in a `secondary_offset` field:

- `reference_station`: String - The ID of the reference station
- `height_offset`: Object - Defines the values to add to water levels
  - `high`: Float - Height offset to add to the high tide (can be negative)
  - `high`: Float - Height offset to add to the low tide (can be negative)
- `time_offset`: Object - Defines the time to add to when a high or low tide will occur
  - `high`: Float - Time offset, **in minutes**, to add to the high tide (can be negative)
  - `high`: Float - Time offset, **in minutes**, to add to the low tide (can be negative)

## <a name="station-types"/>Types of stations

Stations can either be _reference_ or _secondary_, defined in the station's `type` field.

### Reference station

Reference stations have defined hamonic constituents. They should have an array of `harmonic_constituents`. These are usually stations that have a long selection of real water level observations.

### Secondary station

Secondary stations (commonly called "subordinate stations") are locations that have a very similar tides to a reference station. Usually these are geographically close to another reference station.

Secondary stations have four kinds of offsets, two to correct for water level, and two for the time of high and low tide. They use a `secondary_offset` object to define these items, along with the name of the reference station they are based on.
