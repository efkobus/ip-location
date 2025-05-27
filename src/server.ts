import express from 'express';
import { Server } from 'http';
import { ipLocationController } from './controllers/ip-location-controller';

let server: Server | null = null;

export function createServer(): express.Application {
  const app = express();
  app.use(express.json());
  app.get('/ip/location', ipLocationController);
  app.use((_, res) => {
    res.status(404).json({ error: 'Not Found' });
  });
  return app;
}

export function start(port = 3000): void {
  if (server) return;
  const app = createServer();
  server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

export function stop(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!server) {
      resolve();
      return;
    }
    server.close(err => {
      if (err) return reject(err);
      server = null;
      resolve();
    });
  });
}
