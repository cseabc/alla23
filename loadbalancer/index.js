// index.js

const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const dotenv = require('dotenv');
const https = require('https');

dotenv.config();

const app = express();
const PORT = process.env.LB_PORT || 3000;

// Define backend servers
const backends = [
  process.env.SERVER1_URL,
  process.env.SERVER2_URL,
  process.env.SERVER3_URL,
].filter(Boolean);

if (backends.length === 0) {
  console.error('Error: No backend servers configured.');
  process.exit(1);
}

// HTTPS agent with keep-alive for performance
const agent = new https.Agent({
  keepAlive: true,
  maxSockets: 100,
});

// Round-robin index
let currentIndex = 0;

// Function to get the next backend server
function getNextBackend() {
  const backend = backends[currentIndex % backends.length];
  currentIndex++;
  return backend;
}

// Proxy middleware to forward requests
function proxyMiddleware(req, res, next) {
  const target = getNextBackend();
  console.log(`[LoadBalancer] Forwarding ${req.method} ${req.originalUrl} to ${target}`);

  createProxyMiddleware({
    target,
    changeOrigin: true,
    secure: true,
    agent,
    logLevel: 'warn',
    headers: {
      'X-Forwarded-For': req.ip,
    },
  })(req, res, next);
}

// Route to handle API requests
app.use('/api/results', proxyMiddleware);

// Health check endpoint for the load balancer
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Load Balancer is running on port ${PORT}`);
});
