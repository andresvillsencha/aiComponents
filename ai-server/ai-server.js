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
 * npm install body-parser
 * npm install openai
 * npm install @anthropic-ai/sdk
 * npm install axios
 * 
 */


// Get Env Variables
  require('dotenv').config(); 

// Replace by your backend domain
  const port=process.env.PORT;
  const myServerUrl = 'http://localhost:'+port;


// Let's first get the allowed origins
  const allowedOrigins = process.env.CORS.split(',') ;

// Import the Express framework to build the web server
  const express = require('express');
  const cors = require('cors');
  const bodyParser = require('body-parser');

// These are your endpoints
  const parseQuery = [
    { query: require('./endpoints/ai/handlers/ai-smart-search'), api: '/api/ai-smart-search' },
    { query: require('./endpoints/ai/handlers/ai-smart-fill'), api: '/api/ai-smart-fill' },
    { query: require('./endpoints/ai/handlers/ai-smart'), api: '/api/ai-smart' },
  ]; 
  const app = express();

// Enable CORS to allow requests from the Ext JS app hosted at this specific origin
  app.use(cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Domain not allowed by CORS'));
      }
    },
    credentials: true // if you need cookies or auth headers
  }));


  app.use(bodyParser.json());
  parseQuery.forEach(element => {
    app.use(element.api, element.query);
  });
  app.listen(port, () => {
    console.log('AI Server running on ' + myServerUrl);
    if ( process.env.cors) console.log('CORS Servers;\n- ' + process.env.cors.replace(/,/g, '\n- '))
  });

