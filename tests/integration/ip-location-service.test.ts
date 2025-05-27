import request from 'supertest';
import path from 'path';
import { loadDataset } from '../../src/services/ip-location-service';
import { createServer } from '../../src/server';
import { Application } from 'express';

const fixture = path.join(__dirname, '../fixtures/ip-location-test.csv');
let app: Application;

beforeAll(async () => {
  await loadDataset(fixture);
  app = createServer();
});

describe('GET /ip/location (integration)', () => {
  it('should return 200 with valid JSON for mapped IP', async () => {
    const res = await request(app).get('/ip/location?ip=1.0.0.10');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      country:     expect.any(String),
      countryCode: expect.any(String),
      city:        expect.any(String),
    });
  });

  it('should return 404 for unmapped IP', async () => {
    const res = await request(app).get('/ip/location?ip=0.0.0.0');
    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({ error: 'Location not found' });
  });
});
