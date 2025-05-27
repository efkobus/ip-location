import path from 'path';
import { loadDataset, findLocation } from '../../src/services/ip-location-service';
import { ipToId } from '../../src/utils/ip-calculator';

describe('ip-location-service (unit)', () => {
  beforeAll(async () => {
    const fixture = path.join(__dirname, '../fixtures/ip-location-test.csv');
    await loadDataset(fixture);
  });

  it('finds location for IP within the first range', () => {
    const id = ipToId('1.0.0.10');
    const loc = findLocation(id)!;
    expect(loc).toMatchObject({
      countryCode: 'US',
      country:     'United States of America',
      city:        'Los Angeles',
    });
  });

  it('handles lower and upper boundary values', () => {
    const lower = ipToId('1.0.0.0');
    const upper = ipToId('1.0.0.255');
    expect(findLocation(lower)).toMatchObject({ countryCode: 'US' });
    expect(findLocation(upper)).toMatchObject({ countryCode: 'US' });
  });

  it('returns next block for IP just outside previous range', () => {
    const next = ipToId('1.0.1.0');
    expect(findLocation(next)).toMatchObject({
      countryCode: 'CN',
      country:     'China',
      city:        'Fuzhou',
    });
  });

  it('returns null for an IP not in any range', () => {
    expect(findLocation(1)).toBeNull();
  });
});
