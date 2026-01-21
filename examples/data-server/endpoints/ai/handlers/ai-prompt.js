/**
 * Node JS Endpoint
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
    const debug = true; // Enable/disable server debug logging

// Available AI LLMs
    const defaultProvider = "chatgpt";
    const aiProviders = {
        'chatgpt': './../services/chatgpt',
        'claude': './../services/claude',
        'localllm': './../services/local',
    };

    function extractParams(req) {
        let query = req.body.query;
        let llmConfig = query.llmConfig || {};
        query.type=query.type || 'searchbar';
        let params = {
            query: query,
            type: query.type,
            model: query.llmConfig.model || null,
            llmConfig: llmConfig,
            provider: llmConfig.provider || defaultProvider,
            endPoint: aiProviders[llmConfig.provider] || null,
            systemPrompt: (llmConfig.systemPrompt && llmConfig.systemPrompt.name) ? llmConfig.systemPrompt.name : 'Not Set'
        };

        return params;
    }

// Endpoint processing
    router.post('/', async (req, res) => {
        let params = extractParams(req);
        let query = params.query;
        // Build the full prompt


        if (debug) {
            console.log("========");
            console.log('Starting LLM: ' + params.provider);
            console.log('Provider EP: ' + params.endPoint);
            console.log('Config: ');
            console.log(' * System Prompt: ' + params.systemPrompt);
            console.log("========");
        } 

        if (aiProviders.hasOwnProperty(params.provider)) {
            // Connect to endPoint
                const {getResponse} = require(params.endPoint);
                res = getResponse(params, res, debug);
        } else {
            // Return error
            if (debug) console.error('Incorrect Provider');
            res.status(500).json({ error: 'Incorrect or unavailable Provider.' });
        }
        
    });

// Export this router to be used in the main Express app
module.exports = router;