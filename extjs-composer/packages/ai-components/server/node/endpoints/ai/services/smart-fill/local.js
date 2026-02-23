/**
 * Node JS Endpoint
 * LOCAL LLM
 * Reads Fill prompt, and process it
 * 
 */
// Import required modules
    const AiConn = require('axios'); 
    const MAX_TOKENS = 512;
    
    const {getAiFillResponse} = require('../shared-methods');

// You should have a dotenv file with your AI API Key
    require('dotenv').config(); 
    
// Available models. Use this to avoid injecting another model to the prompt
    const modelVar = 'LOCAL_';

    const localLLM = {
        url: process.env.LOCAL_LLM_URL,
        key: process.env.LOCAL_LLM_API_KEY,
    };

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
                cached_tokens: 0,
                cached: false,
                real_tokens: tokenData.total_tokens
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

                const completion = await AiConn.post(localLLM.url, {
                    model: model,
                    max_tokens: MAX_TOKENS,
                    messages: [{
                        role: 'system', 
                        content: systemPrompt
                    }, {
                        role: 'user', 
                        content: userPrompt
                    }]
                });

                // Validate the response
                    if (!completion || !completion.data.choices || !completion.data.choices[0]) {
                        throw new Error('Invalid GPT response structure');
                    }

                // Extract the assistant's text reply from the response
                    const gptText = completion.data.choices[0].message.content;
                // Extract the assistant's text reply from the response
                    response.gptText = completion.content[0].text;
                    response.tokenData = getTokenData(completion.data.usage);
                    response.completion = completion;
            });
        // Return response
            return res;
    }


    module.exports = {
        getResponse
    };
