// index.js
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const https = require('https');
const dotenv = require('dotenv');

dotenv.config();
const app = express();
const PORT = process.env.LB_PORT || 3000;

// Backend URLs
const backends = [
  process.env.SERVER1_URL, // e.g. 'https://server1-kqqv.onrender.com'
  process.env.SERVER2_URL, // e.g. 'https://server2-9g66.onrender.com'
  process.env.SERVER3_URL  // e.g. 'https://server3-h1yh.onrender.com'
].filter(Boolean);

if (backends.length === 0) {
  console.error('Error: No backends configured.');
  process.exit(1);
}

// HTTPS agent with keep‑alive
const agent = new https.Agent({
  keepAlive: true,
  maxSockets: 100
});

// Round‑robin index
let idx = 0;
function getNextTarget() {
  const target = backends[idx % backends.length];
  idx++;
  return target;
}

// Proxy middleware factory
function roundRobinProxy(req, res, next) {
  const target = getNextTarget();
  console.log(`[LB] ${req.method} ${req.originalUrl} → ${target}`);
  createProxyMiddleware({
    target,
    changeOrigin: true,
    secure: true,
    agent,                // reuse connections
    logLevel: 'warn',
    headers: {
      // (optional) identify LB
      'X-Forwarded-For': req.ip
    }
  })(req, res, next);
}

// Mount proxy on desired path
app.use('/api/results', roundRobinProxy);

// (Optional) simple LB health endpoint
app.get('/health', (_req, res) => res.json({ status: 'UP' }));

app.listen(PORT, () => {
  console.log(`⚡️ Load Balancer listening on port ${PORT}`);
});
