const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
const cors = require('cors');
const https = require('https');

dotenv.config();

const app = express();
const PORT = process.env.LB_PORT || 3000;

app.use(cors());
app.use(express.json());

// Create an HTTPS agent (if needed, for development/testing purposes)
// (Be cautious: rejectUnauthorized: false is not recommended for production)
const agent = new https.Agent({
  rejectUnauthorized: false,
});

// Define backend server names for simulation purposes
const serverNames = ['Server India', 'Server USA', 'Server China'];

// Load backend URLs from individual environment variables and assign names
const backendEnvVars = ['SERVER1_URL', 'SERVER2_URL', 'SERVER3_URL'];
const backends = backendEnvVars
  .map((envVar, index) => {
    const url = process.env[envVar];
    if (url) {
      return {
        url: url.trim(),
        name: serverNames[index] || `Server ${index + 1}`,
        healthy: false,
        activeConnections: 0,
        totalRequests: 0,
      };
    }
    return null;
  })
  .filter(b => b !== null);

if (backends.length === 0) {
  console.error('No backend URLs provided in environment variables.');
  process.exit(1);
}

// Health check: ping each backend's /health endpoint
const performHealthCheck = async () => {
  for (let backend of backends) {
    try {
      const response = await axios.get(`${backend.url}/health`, {
        timeout: 5000,
        httpsAgent: agent,
      });
      // Parse response if needed and check if status is "ok" or "UP"
      let data = response.data;
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data);
        } catch (parseErr) {
          console.error(`Parsing error for ${backend.url}:`, parseErr.message);
          backend.healthy = false;
          continue;
        }
      }
      backend.healthy =
        data &&
        typeof data.status === 'string' &&
        (data.status.toLowerCase() === 'ok' || data.status.toUpperCase() === 'UP');
      console.log(`${backend.url}: Health check status: ${data.status}`);
    } catch (error) {
      console.error(`Health check failed for ${backend.url}:`, error.message);
      backend.healthy = false;
    }
  }
};

// Run health check every 10 seconds
setInterval(performHealthCheck, 10000);
performHealthCheck();

// Round-robin selection for healthy backends
let currentIndex = 0;
const selectBackend = () => {
  const healthyBackends = backends.filter(b => b.healthy);
  if (healthyBackends.length === 0) return null;
  const backend = healthyBackends[currentIndex % healthyBackends.length];
  currentIndex++;
  return backend;
};

// Proxy API requests; add servedBy info in response
app.get('/api/results/:rollno', async (req, res) => {
  const rollno = req.params.rollno;
  const backend = selectBackend();
  if (!backend) {
    return res.status(503).json({ message: 'No healthy backend available' });
  }
  const targetUrl = `${backend.url}/api/results/${rollno}`;
  backend.activeConnections++;
  backend.totalRequests++;
  
  console.log(`Forwarding request for rollno ${rollno} to ${targetUrl}`);
  
  try {
    const response = await axios.get(targetUrl, {
      timeout: 10000,
      httpsAgent: agent,
    });
    // Append the serving backend name to the response data
    let responseData = response.data;
    // If responseData is an object, add servedBy; otherwise, create an object
    if (typeof responseData === 'object' && responseData !== null) {
      responseData.servedBy = backend.name;
    } else {
      responseData = { data: responseData, servedBy: backend.name };
    }
    res.status(response.status).json(responseData);
  } catch (error) {
    console.error('Error forwarding request:', error.message);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ message: 'Error forwarding request' });
    }
  } finally {
    backend.activeConnections--;
  }
});

// Health check endpoint for load balancer
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP' });
});

app.listen(PORT, () => {
  console.log(`Load Balancer running on port ${PORT}`);
});
