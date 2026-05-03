import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import 'dotenv/config';
import apiApp from './api/index';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Mount the serverless API routes
  app.use(apiApp);

  // Vite Integration for React Frontend
  if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else if (!process.env.VERCEL) {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Only listen to port if not in Vercel Serverless environment
  if (!process.env.VERCEL) {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
  
  return app;
}

const appPromise = startServer();
export default async function (req: any, res: any) {
  const app = await appPromise;
  app(req, res);
}
