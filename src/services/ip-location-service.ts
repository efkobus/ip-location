import fs from 'fs';
import { createInterface } from 'readline';

export interface IpRange {
  lowerIpId: number;
  upperIpId: number;
  countryCode: string;
  countryName: string;
  city: string;
}

export interface Location {
  country: string;
  countryCode: string;
  city: string;
}

let ipRanges: IpRange[] = [];

/**
 * Streams and parses the CSV dataset.
 * Discards empty, malformed, or placeholder (`-`) entries.
 */
export async function loadDataset(filePath: string): Promise<void> {
  await fs.promises.access(filePath, fs.constants.R_OK).catch(() => {
    throw new Error(`CSV file not found or not readable at path: ${filePath}`);
  });

  const reader = createInterface({
    input: fs.createReadStream(filePath),
    crlfDelay: Infinity,
  });
  const ranges: IpRange[] = [];

  for await (const rawLine of reader) {
    const line = rawLine.trim();
    if (!line) continue;

    const parts = line.split(',').map(s => s.replace(/^"|"$/g, '').trim());
    if (parts.length < 6) continue;

    const lower = parseInt(parts[0], 10);
    const upper = parseInt(parts[1], 10);
    if (Number.isNaN(lower) || Number.isNaN(upper)) continue;

    const countryCode = parts[2];
    const countryName = parts[3];
    const city = parts[5];

    if (countryCode === '-' || countryName === '-' || city === '-') continue;

    ranges.push({ lowerIpId: lower, upperIpId: upper, countryCode, countryName, city });
  }

  ipRanges = ranges.sort((a, b) => a.lowerIpId - b.lowerIpId);
}

/**
 * Binary-searches the loaded ranges for a matching IP ID.
 * Returns null if no range contains the IP.
 */
export function findLocation(ipId: number): Location | null {
  let low = 0;
  let high = ipRanges.length - 1;

  while (low <= high) {
    const mid = low + ((high - low) >> 1);
    const { lowerIpId, upperIpId, countryCode, countryName, city } = ipRanges[mid];

    if (ipId < lowerIpId) {
      high = mid - 1;
    } else if (ipId > upperIpId) {
      low = mid + 1;
    } else {
      return { country: countryName, countryCode, city };
    }
  }

  return null;
}
