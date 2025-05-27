import { loadDataset } from './services/ip-location-service';
import { start } from './server';

const IP_LOCATION_DATASET = 'data/IP2LOCATION-LITE-DB11.CSV';

async function main() {
  await loadDataset(IP_LOCATION_DATASET);
  start();
}

main().catch(err => console.error('Error starting application:', err));