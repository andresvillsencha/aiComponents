/**
 * Node JS Endpoint
 * Shared methods between all providers
 * 
 */
// Import required modules
    const fs = require('fs');
    const promptFolder = "./endpoints/ai/prompts/";
    const STATIC_PREFIX_VERSION = "AI_EXTJS_OPENAI_";




/***************************
 * PROMPT CREATION METHODS *
 ***************************/
    /**
     * Gets the field list from the front end request
     * While in this example this is not sanitized, be careful, and make sure the structure/object
     * is correctly built
     * @param {*} fields 
     * @returns 
     */
    function createFieldPrompt(fields, withType=true) {
        let fieldPrompt = "";
        if (!Array.isArray(fields)) fields=[];

        fields.forEach((field, index) => {
            if (withType) {
                if (field['type']==='list' && Array.isArray(field['options'])) {
                    fieldPrompt += `- ${field['name']}(${field['type']}: ${JSON.stringify(field['options'])})\n`;
                } else {
                    fieldPrompt += `- ${field['name']}(${field['type']})\n`;
                }
            } else {
                if (index>0) fieldPrompt += `,`;
                fieldPrompt += `${field['name']}`;
            }
        });
        return fieldPrompt;
    }

    /**
     * Receives a JS object with the prompt and fields,
     * returns the final string to be used as prompt
     * @param {string} prompt 
     * @returns {string}  
     */
    function createPrompt(prompt) {
        return `Input: "${prompt}" \n Output: (JSON only)`;
    }

    /**
     * Used to read from jsonFile with the system prompt
     * @param {String} promptFile 
     * @returns null|Object
     */
    function readFile(promptFile) {
        let data = {
            success: false,
            fields: [],
        };
        try {
            let rawData = fs.readFileSync(promptFolder + promptFile, 'utf8');
            if (rawData) {
                data = JSON.parse(rawData);
            } else {
                console.log('File could not be read');
            }
        } catch (err) {
            console.log('Incorrect system file content');
        }
        return data;
    }

    /**
     * Reads from an array of strings, and generates a long string
     * If param is already a string, it just returns it
     * @param {String|Array} arrayOfStrings 
     */
    function readArray(arrayOfStrings, lineChar='') {
        lineChar = lineChar || '';
        if (Array.isArray(arrayOfStrings)) {
            return arrayOfStrings.join('\n'+lineChar);
        } else if (typeof arrayOfStrings === 'string') {
            return arrayOfStrings;
        } else {
            return "";
        }
    }

    /**
     * Will read an array or string, turn it into an array, and push the second array data
     * @param {*} firstArray 
     * @param {*} secondArray 
     * @param {*} lineChar 
     * @returns 
     */
    function arrayCombine(firstArray, secondArray, lineChar='') {
        lineChar=lineChar||'';
        // is second array is not and array, it will be turned into an empty array
        if (!Array.isArray(secondArray)) secondArray=[]; 

        // if first array is string, it will turn into an array, if it is not array nor string, it will be turned into an empty array
        if (typeof arrayOfStrings === 'string') {
            firstArray=[firstArray];
        } else if (!Array.isArray(firstArray))  {
            firstArray=[];
        }

        if (lineChar!=='') {
            secondArray=secondArray.map(el => lineChar + el);
        }

        return firstArray.concat(secondArray);
    }

    /**
     * Will read the systemPrompt file :
     * 
     * @param {*} fields 
     * @param {*} llmConfig 
     * @returns 
     */
    function getSystemPrompt( fields, llmConfig) {
        let promptFile = llmConfig.systemPrompt.name;
        let promptData = null;

        promptData = readAndInterpretPromptFile(promptFile+'.json', fields, llmConfig);

        return promptData;
    }

    function readAndInterpretPromptFile(promptFile, fields, llmConfig) {
        let jsonData = readPromptFile(promptFile, fields, llmConfig);
        let jsonString = interpretPromptFile(jsonData);


        return jsonString;
    }

    function interpretPromptFile(promptObj) {
        let prompt="";

        if (promptObj!==null) {
            // Add Descriptor
                prompt += "\n"+readArray(promptObj.description);
            // Add fields
                if (typeof promptObj.fields !== undefined && Array.isArray(promptObj.fields) && promptObj.fields.length>0) {
                    prompt += "\nFields (name->type):" + createFieldPrompt(promptObj.fields, true);
                }
            // Add Operators
                prompt += "\n"+readArray(promptObj.operators);
            // Add Rules
                prompt += "\n"+readArray(promptObj.rules);
            // Add Extra Rule
                if (typeof promptObj.fields !== undefined && Array.isArray(promptObj.fields) && promptObj.fields.length>0) {
                    prompt += "\n- You must only output fields that exist in the following whitelist: " + createFieldPrompt(promptObj.fields, false);
                }
            // Add Output Shape
                prompt += "\n"+readArray(promptObj.output);
            // Add examples
                prompt += "\n"+readArray(promptObj.examples);
        } 

        
        return prompt;
    }

    /**
     * Reads the prompt File, and adds fields, rules and examples
     * @param {*} promptFile 
     * @param {*} fields 
     * @param {*} llmConfig 
     * @returns 
     */
    function readPromptFile(promptFile, fields, llmConfig) {
        let promptObj = readFile(promptFile);

        // Add fields
            promptObj.fields = fields;
        // Add Rules
            promptObj.rules=arrayCombine(llmConfig.rules,promptObj.rules,'');
        // Add examples
            promptObj.examples=arrayCombine(llmConfig.rules,promptObj.examples,'');
        
        return promptObj;
    }


    /**
     * Reads the params sent by the front end, and validates them, if they are incorrect or incomplete, it will set success as false
     * @param {*} params The query sent by the Ext JS custom component
     * @returns 
     */
    function getParams(params) {
        let llmConfig = params.llmConfig || {};
        let newParams = {
            name: params.name || 'AI_QUERY',
            llmConfig: {
                provider:  llmConfig.provider,
                model:  llmConfig.model,
                systemPrompt: {
                    name: params.systemPrompt,
                    build: false,
                    overwrite: false
                },
                rules: params.llmConfig.rules || [],
                examples: params.llmConfig.examples || []
            },
            prompt: params.prompt || null,
            fields: params.fields || []
        };

        return newParams;
    }


    /**
     * Smart AI Connection
     * Reads the prompt and query params and builds the system prompt to be sent to the AI Provider
     * Returns the AI response
     * @param {*} params 
     * @param {*} res 
     * @param {*} debug 
     * @param {*} connMethod 
     * @param {*} responseParams 
     * @returns 
     */
    async function getAiResponse(model, query, res, debug, connMethod, responseParams) {

        // Gets Params for later use
            let fields = query.fields || [];
            let cacheName = query.name || STATIC_PREFIX_VERSION;
            let prompt = query.prompt || '';
            let provider = query.llmConfig.provider || '-';

            console.log(query);

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
                        const completion = (connMethod!==undefined) ? await connMethod(model, cacheName, systemPrompt, userPrompt) : {};

                            if (debug) {
                                console.log("================= RESPONSE ===================");
                                console.log('Tokens: ' + completion.tokenData.prompt_tokens);
                                console.log('Response: '+ completion.gptText);
                                console.log("=============================================");
                            } 

                        // Attempt to extract a JSON block from the GPT reply
                            const match = completion.gptText.match(/\{[\s\S]*\}/); // Match content enclosed in braces
                            if (!match) throw new Error('Could not extract JSON from GPT output');

                        // Parse the JSON content and send it as the API response
                            let json = JSON.parse(match[0]);
                            json.tokenData = completion.tokenData; // add the total tokens to the response

                        // Let's add the response config, that may include the fields or other data  for reference when returned to the front end
                            // json._responseParams=responseParams;
                            json.llmConfig = {
                                model: model,
                                provider: provider,
                                aiType: query.aiType || '-'
                            };
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
    }


    /**
     * Smart Search Connection
     * Reads the prompt and query params and builds the system prompt to be sent to the AI Provider
     * Returns the AI response
     * @param {*} params 
     * @param {*} res 
     * @param {*} debug 
     * @param {*} connMethod 
     * @returns 
     */
    async function getAiSearchResponse(params, res, debug, connMethod) {
        //let query = getParams(params.query);
        
        res = await getAiResponse(params.model, params, res, debug, connMethod, { 
            type: "search",
            fields: params.fields
        });
        return res;
    }


    /**
     * Connects to the AI Provider using the selected prompt.
     * Returns the response from the AI model
     * @param {*} params 
     * @param {*} res 
     * @param {*} debug 
     * @param {*} connMethod 
     * @returns 
     */
    async function getAiFillResponse(params, res, debug, connMethod) {
        //let query = getParams(params.query);
        res = await getAiResponse(params.model, params, res, debug, connMethod, { 
            type: "fill",
            fields: params.fields
        });
        return res;
    }
    
    
    /**
     * Connects to the AI Provider using the selected prompt.
     * Returns the response from the AI model
     * @param {*} params 
     * @param {*} res 
     * @param {*} debug 
     * @param {*} connMethod 
     * @returns 
     */
    async function getAiGenResponse(params, res, debug, connMethod) {
        //let query = getParams(params.query);
        res = await getAiResponse(params.model, params, res, debug, connMethod, { 
            type: "generic",
            fields: params.fields
        });
        return res;
    }
// EXPORTS
    module.exports = {
        getAiSearchResponse,
        getAiFillResponse,
        getAiGenResponse
    };