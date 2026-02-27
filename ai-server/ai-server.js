/**
 * Express Backend Server for Ext JS Frontend
 * ------------------------------------------
 * Sets up a basic Node.js/Express server used as a backend for an Ext JS frontend application.
 * 
 * Key Features:
 * - CORS is enabled allowing requests from the Ext JS app.
 * - JSON request bodies are parsed using `body-parser`.
 * - A modular route handler is mounted at `/api/parse-query` to handle GPT-based query parsing.
 * - The server listens on port 3000.
 * 
 * This file acts as the entry point for the backend API and is designed to facilitate communication between
 * the Ext JS frontend and an OpenAI-based query parser route.
 * 
 * Request Structure
 *  Endpoint: http://localhost:3000/api/interpret-prompt
 *  Method: POST
 *  Headers:
 *    Content-Type: application/json
 *  Body: 
 *    {
 *      "query": "Show me all users from Mexico who signed up in the last 30 days"
 *    }
 * 
 * 
 * NODE PACKAGES:
 * npm install express
 * npm install cors
 * npm install dotenv
 * npm install openai
 * npm install @anthropic-ai/sdk
 * npm install axios
 * 
 */


// Get Env Variables
  require('dotenv').config();

// Import the Express framework to build the web server
  const express = require('express');
  const cors = require('cors');
  const rateLimit = require("express-rate-limit");

// Replace by your backend domain
  const PORT = process.env.PORT || '3000';
  const myServerUrl = 'http://localhost:'+PORT;

// Server limits  
  const REQUEST_MAX = process.env.REQUEST_MAX || 10; // if not set, max requests will be 10 per 5 minutes
  const REQUEST_TIME = process.env.REQUEST_TIME || 5;


// Let's first get the allowed origins
  const allowedOrigins = (process.env.CORS || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
  


// These are your endpoints
  const routes  = [
    { router: require('./endpoints/ai/handlers/ai-smart-search'), path: '/api/ai-smart-search' },
    { router: require('./endpoints/ai/handlers/ai-smart-fill'), path: '/api/ai-smart-fill' },
    { router: require('./endpoints/ai/handlers/ai-smart'), path: '/api/ai-smart' },
  ]; 

  const app = express();

  // Read the json
    app.use(express.json());

// ---- Rate limiting (protects your LLM bill + abuse) ----
  app.use(
    rateLimit({
      windowMs: REQUEST_TIME * 60 * 1000, // 15 minutes
      max: REQUEST_MAX, // adjust based on expected traffic
      standardHeaders: true,
      legacyHeaders: false
    })
  );


// Enable CORS to allow requests from the Ext JS app hosted at this specific origin
  app.use(cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);

      // MAKE SURE CORS IS SET
      if (allowedOrigins.length === 0) {
        return callback(new Error('CORS not configured (CORS env var is empty).'));
      }
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Domain not allowed by CORS : ${origin}`));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true // if you need cookies or auth headers
  }));

// Health check
  app.get('/healthz', (req, res) => res.json({ ok: true }));
 
// Create API calls/router
  for (const { path, router } of routes) {
    app.use(path, router);
  }

  // Central error handler (including CORS errors)
  app.use((err, req, res, next) => {
    const status = err.message?.startsWith('Origin not allowed by CORS') ? 403 : 500;
    res.status(status).json({
      error: status === 403 ? 'CORS_FORBIDDEN' : 'INTERNAL_ERROR',
      message: err.message || 'Unexpected error',
    });
  });

  app.listen(PORT, () => {
  console.log(`AI Server listening on ${myServerUrl}`);
  if (allowedOrigins.length) {
    console.log('CORS allowed origins:\n- ' + allowedOrigins.join('\n- '));
  } else {
    console.warn('CORS env var is empty. No browser origins are allowed.');
  }
});

