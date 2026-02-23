/**
 * Node JS Endpoint
 * CLAUDE
 * Reads Fill prompt, and process it
 * 
 */
// Import required modules
    const Anthropic = require('@anthropic-ai/sdk');
    const MAX_TOKENS = 512;
    
    const {getAiFillResponse} = require('../shared-methods');

    
// Available models. Use this to avoid injecting another model to the prompt
    const modelVar = 'CLAUDE_';
    const models = process.env[modelVar+'MODELS']
        ? process.env[modelVar+'MODELS'].split(',').map(s => s.trim())
        : [];
    const defaultModel = process.env[modelVar+'DEFAULT_MODEL'] || models[0] || "";

// Initialize Claude client with API key from environment variable
    const AiConn = new Anthropic({
        apiKey: process.env.CLAUDE_API_KEY 
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
                prompt_tokens: tokenData.input_tokens,
                completion_tokens: tokenData.output_tokens,
                total_tokens: tokenData.input_tokens + tokenData.output_tokens,
                cached_tokens: tokenData.cache_creation_input_tokens + tokenData.cache_read_input_tokens,
                cached: (tokenData.cache_creation_input_tokens + tokenData.cache_read_input_tokens)>0,
                real_tokens: tokenData.input_tokens + tokenData.output_tokens -tokenData.cache_creation_input_tokens - tokenData.cache_read_input_tokens,
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
    async function getResponse(params, res, debug) {
        // Connect
            params.model = params.model || defaultModel;
            if (process.env.VALIDATE_MODEL && models && models.length>0 && !models.includes(params.model.toLowerCase())) params.model=defaultModel;

            res = getAiFillResponse(params, res, debug, async function (model, cacheName, systemPrompt, userPrompt) {
                let response = {};
                const completion = await AiConn.messages.create({
                    model: model,        // or another Claude model
                    max_tokens: MAX_TOKENS,
                    system: systemPrompt, 
                    messages: [{
                        role: 'user',
                        content: userPrompt
                    }]
                });


                if (!completion || !completion.content || !completion.content[0]) {
                    throw new Error('Invalid Claude response structure');
                }
                // Extract the assistant's text reply from the response
                    response.gptText = completion.content[0].text;
                    response.tokenData = getTokenData(completion.usage);
                    response.completion = completion;

                return response;
            });
        // Return response
            return res;
    }


    module.exports = {
        getResponse
    };
