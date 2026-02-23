/**
 * Node JS Endpoint
 * SMART FILL
 * 
 * Main Endpoint, depending on the specified provider, it is the subfile that will be called
 * Parameters for the call are explained inside the matching file
 * Providers:
 *  'chatgpt': 'ai/chatgpt.js',
 *  'claude': 'ai/claude.js',
 * 
 * Parameters to be sent from the frontend
 * * name:          Unique name to be used for caching
 * * llmConfig.
 * *    aiProvider:    The Ai Provider: chatgpt, claude, etc.
 * *    model:         The model to be used. i.e. "gpt-4o-mini"
 * * prompt: prompt,
 * * fields: me._getColumns(linkedGrid),
 * * rules: me.config.rules
 *  
 */
// Import required modules
    const express = require('express');
    const router = express.Router(); 
    const {extractParams} = require('../services/ai-params');
    const debug = true; // Enable/disable server debug logging

// Available AI LLMs
    const defaults = {
        provider: "openai",
        promptFile: "form-prompt",
    };
    const type = "smart-fill";

// Endpoint processing
    router.post('/', async (req, res) => {
        let params = extractParams(req, type, defaults);
        // Build the full prompt

        if (debug) {
            console.log("========");
            console.log('AI Tool: '+type );
            console.log('Starting LLM: ' + params.llmConfig.provider);
            console.log('Provider EP: ' + params.llmConfig.endPoint);
            console.log('Config: ');
            console.log(' * System Prompt: ' + params.llmConfig.systemPrompt);
            console.log("========");
        } 

        if (params.active) {
            // Connect to endPoint
                const {getResponse} = require(params.llmConfig.endPoint);
                res = getResponse(params, res, debug);
        } else {
            // Return error
            if (debug) console.error('Incorrect Provider');
            res.status(500).json({ error: 'Incorrect or unavailable Provider.' });
        }
        
    });

// Export this router to be used in the main Express app
module.exports = router;