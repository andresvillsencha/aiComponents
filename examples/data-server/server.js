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
 */


require('dotenv').config(); 

// PORT AND CORS
  const port = process.env.PORT;
  const myServerUrl = 'http://localhost:'+port;
  const allowedOrigins = process.env.CORS.split(',') ;

// Import the Express framework to build the web server
  const express = require('express');
  const cors = require('cors');
  const bodyParser = require('body-parser');

// These are your endpoints
  const parseQuery = [
    { query: require('./endpoints/data/school-data'), api: '/api/school-data' },
    { query: require('./endpoints/data/healthcare-data'), api: '/api/healthcare-data' },
    { query: require('./endpoints/data/banking-data'), api: '/api/banking-data' },
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
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true // if you need cookies or auth headers
  }));


  app.use(bodyParser.json());
  parseQuery.forEach(element => {
    app.use(element.api, element.query);
  });
  app.listen(port, () => console.log('Data Server running on ' + myServerUrl));

