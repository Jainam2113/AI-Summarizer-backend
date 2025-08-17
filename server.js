const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables first
dotenv.config();

const summarizeRouter = require('./routes/summarize');
const emailRouter = require('./routes/email');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:3001', 
    'https://ai-summarizer-frontend-eight.vercel.app', 
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api/summarize', summarizeRouter);
app.use('/api/email', emailRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'Server is running!',
    groq_key: process.env.GROQ_API_KEY ? 'Set' : 'Not set',
    gmail_user: process.env.GMAIL_USER ? 'Set' : 'Not set',
    gmail_password: process.env.GMAIL_APP_PASSWORD ? 'Set' : 'Not set'
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log('Environment check:');
  console.log('GROQ_API_KEY:', process.env.GROQ_API_KEY ? 'Set' : 'Not set');
  console.log('GMAIL_USER:', process.env.GMAIL_USER ? 'Set' : 'Not set');
  console.log('GMAIL_APP_PASSWORD:', process.env.GMAIL_APP_PASSWORD ? 'Set' : 'Not set');
});
