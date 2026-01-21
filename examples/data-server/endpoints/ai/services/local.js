/**
 * Node JS Endpoint
 * OPEN AI Chat GPT
 * 
 * 
 */
// Import required modules
    const AiConn = require('axios'); 
    const STATIC_PREFIX_VERSION = "AI_EXTJS_LOCAL_PROMPT";
    const defaultSystemPrompt = "system-prompt.json";
    const MAX_TOKENS = 512;
    
    const {getSystemPrompt, createPrompt, getParams} = require('./shared');

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


// Endpoint processing
    /**
     * Uses the prompt to return a readable json object that will be interpreted by the Searchbar Ext JS component
     * @param {Object} req          Request comming from the frontend
     * @param {Object} res          Respose object
     * @param {Boolean} debug       Boolean that specifies if console log should be performed
     */
    async function getResponse(req, res, debug) {
        let query = getParams(req); //req.body.query;
        let model = query.llmConfig.model || defaultModel;
        let fields = query.fields || [];
        let cacheName = query.name || STATIC_PREFIX_VERSION;
        let prompt = query.prompt || '';
        
        // If the model is not in the models array
            if (models && models.length>0 && !models.includes(model.toLowerCase())) model=defaultModel;

        // Let's first check that we have everything that is required:
            if (typeof prompt === 'string' && prompt.trim()!=="") {
                // STEP 1. Let's create the system Prompt - Which, if it exceeds 1024 tokens, it will be automatically cached
                    let systemPrompt = getSystemPrompt(fields, query.llmConfig);
                    let userPrompt = createPrompt(prompt);

                // Step 2. Connect to AI
                    try {
                        if (systemPrompt==="") {
                            throw new Error('Invalid System File');
                        }

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

                            if (debug) {
                                console.log("================= RESPONSE ===================");
                                console.log('Tokens: '+completion.data.usage.prompt_tokens);
                                console.log('Response: '+gptText);
                                console.log("=============================================");
                            } 

                        // Attempt to extract a JSON block from the GPT reply
                            const match = gptText.match(/\{[\s\S]*\}/); // Match content enclosed in braces
                            if (!match) throw new Error('Could not extract JSON from GPT output');

                        // Parse the JSON content and send it as the API response
                            let json = JSON.parse(match[0]);

                        // Let's add token data
                            json.tokenData = getTokenData(completion.data.usage); // add the total tokens to the response
                            res.json(json);
                    } catch (err) {
                        // Handle and log error
                        if (debug) console.error('AI error:', err);
                        res.status(500).json({ error: 'Failed to generate filters' });
                    }

            } else {
                // Will return an empty object
                console.log('Prompt must not be empty');
                res.status(500).json({ error: 'Prompt can\'t be empty' });
            }

            return res;
    };

// EXPORTS
    module.exports = {
        getResponse
    };