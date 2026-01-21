/**
 * Node JS Endpoint
 * CLAUDE
 * 
 * 
 */
// Import required modules
    const Anthropic = require('@anthropic-ai/sdk');
    const STATIC_PREFIX_VERSION = "AI_EXTJS_CLAUDE_PROMPT";
    const defaultSystemPrompt = "system-prompt.json";
    const MAX_TOKENS = 512;

    const {getSystemPrompt, createPrompt, getParams} = require('./shared');

// Available models. Use this to avoid injecting another model to the prompt
    const defaultModel = "claude-sonnet-4-20250514";
    const models = [
        "claude-sonnet-4",
        "claude-sonnet-4-20250514",
        "claude-haiku-4-5", 
        "claude-haiku-4-5-20251001", 
    ];

// You should have a dotenv file with your AI API Key
    require('dotenv').config(); 

// Initialize Anthropic client with API key from environment variable
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


// Endpoint processing
    /**
     * Uses the prompt to return a readable json object that will be interpreted by the Searchbar Ext JS component
     * @param {Object} req          Request comming from the frontend
     * @param {Object} res          Respose object
     * @param {Boolean} debug       Boolean that specifies if console log should be performed
     */
    async function getResponse(req, res, debug) {
        let query = getParams(req);
        let model = query.llmConfig.model || defaultModel;
        let fields = query.fields || [];
        let cacheName = query.name || STATIC_PREFIX_VERSION;
        let prompt = query.prompt || '';

        console.log(query);
        // console.log(req);
        
        // If the model is not in the models array
            if (models && models.length>0 && !models.includes(model.toLowerCase())) model=defaultModel;

        // Let's first check that we have everything that is required:
            if (typeof prompt === 'string' && prompt.trim()!=="") {
                // STEP 1. Let's create the system Prompt - Which, if it exceeds 1024 tokens, it will be automatically cached
                    let systemPrompt = getSystemPrompt(fields, query.llmConfig);
                    let userPrompt = createPrompt(prompt);

                // Step 2. Connect to Open AI
                    try {
                        if (systemPrompt==="") {
                            throw new Error('Invalid System File');
                        }
                        
                        // Call Claude
                        const completion = await AiConn.messages.create({
                            model: model,        // or another Claude model
                            max_tokens: MAX_TOKENS,
                            system: systemPrompt, 
                            messages: [{
                                role: 'user',
                                content: userPrompt
                            }]
                        });

                        // Validate the response
                            if (!completion || !completion.content || !completion.content[0]) {
                                throw new Error('Invalid Claude response structure');
                            }

                        // Extract the assistant's text reply from the response
                            const gptText = completion.content[0].text;

                            if (debug) {
                                console.log("================= RESPONSE ===================");
                                console.log('Tokens: '+completion.usage.prompt_tokens);
                                console.log('Response: '+gptText);
                                console.log("=============================================");
                            } 

                        // Attempt to extract a JSON block from the GPT reply
                            const match = gptText.match(/\{[\s\S]*\}/); // Match content enclosed in braces
                            if (!match) throw new Error('Could not extract JSON from GPT output');

                        // Parse the JSON content and send it as the API response
                            let json = JSON.parse(match[0]);

                        // Let's add token data
                        console.log(completion.usage);
                            json.tokenData = getTokenData(completion.usage); // add the total tokens to the response
                            res.json(json);
                    } catch (err) {
                        // Handle and log error
                        if (debug) console.error('Claude error:', err);
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