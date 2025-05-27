import { ipToId, isValidIp } from '../../src/utils/ip-calculator';

describe('ipToId / isValidIp', () => {
  it('converts 1.0.0.10 correctly', () => {
    expect(ipToId('1.0.0.10')).toBe(16777226);
  });

  it('accepts valid IPv4 formats', () => {
    expect(isValidIp('0.0.0.0')).toBe(true);
    expect(isValidIp('255.255.255.255')).toBe(true);
    expect(isValidIp('192.168.1.1')).toBe(true);
  });

  it('rejects invalid IPv4 formats', () => {
    expect(isValidIp('256.0.0.1')).toBe(false);
    expect(isValidIp('1.2.3')).toBe(false);
    expect(isValidIp('1.2.3.4.5')).toBe(false);
    expect(isValidIp('abc.def.gha.bcd')).toBe(false);
  });
});
