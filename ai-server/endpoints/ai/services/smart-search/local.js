/**
 * Node JS Endpoint
 * OPEN AI Chat GPT
 * 
 * 
 */
// Import required modules
    const AiConn = require('axios'); 
    const MAX_TOKENS = 512;
    
    const {getAiSearchResponse} = require('../shared-methods');
    

// Available models. Use this to avoid injecting another model to the prompt
    const defaultModel = "claude-3.7-sonnet-reasoning-gemma3-12b";
    // if the array is empty, there won't be a model validation
    const models = [ ];

// You should have a dotenv file with your AI API Key
    require('dotenv').config(); 

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

    async function getAiResponse(params, res, debug) {
        // Connect
            params.model = params.model || defaultModel;
            if (process.env.VALIDATE_MODEL && models && models.length>0 && !models.includes(params.model.toLowerCase())) params.model=defaultModel;

            res = getAiSearchResponse(params, res, debug, async function (model, cacheName, systemPrompt, userPrompt) {
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

                return response;
            });
        // Return response
            return res;
    }




// EXPORTS
    module.exports = {
        getAiResponse
    };