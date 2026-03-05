/**
 * Node JS Endpoint
 * OPEN AI Chat GPT
 * Reads Search prompt and process it
 * 
 */
// Import required modules
    const OpenAI = require('openai'); 
    
    const {getAiSearchResponse} = require('../shared-methods');

// You should have a dotenv file with your AI API Key
    require('dotenv').config(); 

// Available models. Use this to avoid injecting another model to the prompt
    const modelVar = 'OPENAI_';
    const models = process.env[modelVar+'MODELS']
        ? process.env[modelVar+'MODELS'].split(',').map(s => s.trim())
        : [];
    const defaultModel = process.env[modelVar+'DEFAULT_MODEL'] || models[0] || "";

// Initialize OpenAI client with API key from environment variable
    const AiConn = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        baseURL: process.env.OPENAI_BASE_URL || undefined
    });


    /**
     * Gets the token data (if it exists) and returns it as part of the response
     * @param {*} tokenData 
     * @returns 
     */
    function getTokenData(tokenData) {
        let newTokenData={};
        if (tokenData) {
            newTokenData = {
                prompt_tokens: tokenData.prompt_tokens,
                completion_tokens: tokenData.completion_tokens,
                total_tokens: tokenData.total_tokens,
                cached_tokens: tokenData.prompt_tokens_details.cached_tokens,
                cached: (tokenData.prompt_tokens_details.cached_tokens>0),
                real_tokens:tokenData.total_tokens - tokenData.prompt_tokens_details.cached_tokens
            };
        }

        return newTokenData;
    }


    /**
     * Process and gets response.
     * @param {*} params 
     * @param {*} res 
     * @param {*} debug 
     * @returns 
     */
    async function getAiResponse(params, res, debug) {
        // Connect
            params.model = params.model || defaultModel;
            if (process.env.VALIDATE_MODEL && models && models.length>0 && !models.includes(params.model.toLowerCase())) params.model=defaultModel;

            res = getAiSearchResponse(params, res, debug, async function (model, cacheName, systemPrompt, userPrompt) {
                let response = {};
                const completion = await AiConn.chat.completions.create({
                    model: model,
                    prompt_cache_key: cacheName,
                    messages: [
                        { role: 'system', content: systemPrompt }, // Define assistant behavior
                        { role: 'user', content: userPrompt } // Provide user's formatted query
                    ],
                    temperature: 0
                });

                if (!completion || !completion.choices || !completion.choices[0]) {
                    throw new Error('Invalid GPT response structure');
                }
                // Extract the assistant's text reply from the response
                    response.gptText = completion.choices[0].message.content;
                    response.tokenData = getTokenData(completion.usage);
                    response.completion = completion;

                return response;
            });
        // Return response
            return res;
    }

// EXPORTS
    module.exports = {
        getAiResponse
    };