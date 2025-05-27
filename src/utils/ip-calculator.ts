export function ipToId(ip: string): number {
  const ipParts = ip.split('.');
  let ipId = 0;
  for (let index = 0; index < ipParts.length; index++) {
    const element = parseInt(ipParts[index]);
    if (index === 0) {
      ipId += 16777216 * element;
    }
    if (index === 1) {
      ipId += 65536 * element;
    }
    if (index === 2) {
      ipId += 256 * element;
    }
    if (index === 3) {
      ipId += element;
    }
  }
  return ipId;
}

export function isValidIp(ip: string): boolean {
  const regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (!regex.test(ip)) return false;
  const octets = ip.split('.').map(Number);
  return octets.every(octet => octet >= 0 && octet <= 255);
}