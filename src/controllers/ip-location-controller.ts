import { Request, Response } from 'express';
import { ipToId, isValidIp } from '../utils/ip-calculator';
import { findLocation } from '../services/ip-location-service';

const NOT_FOUND = { error: 'Location not found' } as const;

/**
 * Controller for GET /ip/location
 * Returns 404 if IP is invalid or not mapped, per spec.
 */
export function ipLocationController(req: Request, res: Response): void {
  const rawIp = req.query.ip;
  const ip = Array.isArray(rawIp) ? rawIp[0] : rawIp;

  if (!ip || typeof ip !== 'string' || !isValidIp(ip)) {
    res.status(404).json(NOT_FOUND);
    return;
  }

  const ipId = ipToId(ip);
  const location = findLocation(ipId);

  if (!location) {
    res.status(404).json(NOT_FOUND);
    return;
  }
  console.log(`[IP_LOOKUP] found: ${location.countryCode} / ${location.city}`);
  res.status(200).json(location);
}
