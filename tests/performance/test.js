import http from 'k6/http';
import { check } from 'k6';

export const options = {
  vus: 100,
  duration: '30s',
  thresholds: {
    http_req_duration: ['p(95)<100'],
  },
};

const testIps = [
  '1.0.0.1',
  '1.0.1.0',
  '8.8.8.8',
  '1.1.1.1',
  '3.3.3.3',
  '200.200.200.200',
  '255.255.255.255',
];

export default function () {
  const ip = testIps[Math.floor(Math.random() * testIps.length)];
  const res = http.get(`http://localhost:3000/ip/location?ip=${ip}`);

  check(res, {
    'status is 200 or 404': (r) => r.status === 200 || r.status === 404,
    'req duration < 100ms': (r) => r.timings.duration < 100,
  });
}