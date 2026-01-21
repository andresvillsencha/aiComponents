/**
 * Node JS Endpoint
 * Shared methods between all providers
 * 
 */
// Import required modules
    const fs = require('fs');
    const promptFolder = "./endpoints/ai/prompts/";

    const defaultPromptFile = "system-prompt";



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
        let data = null;
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
        let promptFile = llmConfig.systemPrompt.name || defaultPromptFile;
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
                prompt += "\nFields (name->type):" + createFieldPrompt(promptObj.fields, true);
            // Add Operators
                prompt += "\n"+readArray(promptObj.operators);
            // Add Rules
                prompt += "\n"+readArray(promptObj.rules);
                // Add Extra Rule
                    prompt += "\n- You must only output fields that exist in the following whitelist: " + createFieldPrompt(promptObj.fields, false);
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
        let systemPrompt = llmConfig.systemPrompt || {};
        let newParams = {
            name: params.name || 'AI_QUERY',
            llmConfig: {
                provider:  llmConfig.provider,
                model:  llmConfig.model,
                systemPrompt: {
                    name: systemPrompt.name || defaultPromptFile,
                    generate: systemPrompt.generate===true,
                    build: systemPrompt.build===true,
                    overwrite: systemPrompt.overwrite===false,
                },
                rules: params.llmConfig.rules || [],
                examples: params.llmConfig.examples || []
            },
            prompt: params.prompt || null,
            fields: params.fields || []
        };


        return newParams;
    }

// EXPORTS
    module.exports = {
        getSystemPrompt,
        createPrompt,
        getParams
    };