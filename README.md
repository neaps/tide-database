## Tide harmonics database

The availability of good harmonic constituent data varies from country
to country, resulting in very different tide predeictions depending on
what products you use. Within the United States, NOAA provides excellent
harmonic constituents for free, but internationally it is a different
story.

We first observed these challenges in Gulfo Nuevo in Argentina. The gulf
is very deep, with a narrow mouth to the Atlantic and sloping benthic
profile. As a result, the difference between high and low tides is
consistently 5 meters or more. Various websites and products we used had
different levels of accuracy when predicting the tides. We found one
that was just predicting tides from a station over 200km away, outside
the gulf, and therefore completely different in terms of water level and
timing.

The various surf or weather report apps either use old data, or base
large areas of coastline on one station. Many people are still using
pre-2004 data published in Xtide's Harmbase. Harmbase is great, but it's
data is locked in binary files and SQL, and the maintainer [has given up on maintaining it outside the US](https://flaterco.com/xtide/faq.html#60)
.

**All** constituent data is delivered in Meters.

Much effort has been made to cover the [requirements from libTCD](https://flaterco.com/xtide/libtcd.html).

## Submitting data

If you have **at least a year** of hourly water level observations, you can convert those to harmonic constituents and [submit them to this database online](https://neaps.js.org/harmonics) with a simple form.

Your submission will be automatically converted to a Pull Request to this repository.

## Installation

```bash
npm install @neaps/tide-stations
```

## Usage

```typescript
import { nearest, near, stations } from '@neaps/tide-stations';

// All stations
console.log('Total stations:', stations.length);

// Find the nearest station to a given lat/lon
console.log(`Nearest station:`, nearest({ lat: 26.722, lon: -80.031 }));

// Find the 10 nearest stations to a given lat/lon, in order of distance
console.log('5 nearest stations:', near({ lat: 26.722, lon: -80.031 }, 10));
```

## Maintenance

### Automated Updates

A GitHub Action runs monthly on the 1st of each month to automatically update NOAA tide station data. The workflow:
- Fetches the latest station list and harmonic constituents from NOAA's API
- Updates existing station files with new data
- Adds any newly discovered reference stations
- Creates a pull request if changes are detected

You can also manually trigger the workflow from the Actions tab in GitHub.

### Manual Updates

To manually update NOAA stations:

```bash
$ tools/update-noaa-stations
```

This will scan all existing NOAA station files, fetch any new stations from NOAA's API, and update harmonic constituents for all stations.
