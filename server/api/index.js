import { app } from '../src/server.js';

// Vercel serverless function handler
export default async function handler(req, res) {
  // Handle the request using the Express app
  return app(req, res);
}
