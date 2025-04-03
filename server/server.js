const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const resultsRoutes = require('./routes/results');
const errorHandler = require('./middlewares/errorHandler');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(cors());
app.use(express.json());

app.use('/api/results', resultsRoutes);

// Health Check Route for Load Balancer
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP' });
});

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Backend API running on port ${PORT}`);
});
