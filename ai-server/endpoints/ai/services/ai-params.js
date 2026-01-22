// PARAM PROCESSING


    const aiProviders = {
        'chatgpt': '/chatgpt',
        'anthropic': '/claude',
        'localllm': '/local',
    };


    /**
     * Reads the params from the request, and build a valid object
     * @param {*} req 
     * @param {*} type 
     * @param {*} defaults 
     * @returns 
     */
    function extractParams(req, type, defaults) {
        let query = req.body.query;
        let llmConfig = query.llmConfig || {};
        llmConfig.provider = llmConfig.provider || defaults.provider;
        let available = aiProviders.hasOwnProperty(llmConfig.provider);

        let params = {
            active: available,
            aiType: type,
            type: query.type || 'searchbar',
            prompt: query.prompt,
            fields: query.fields || [],
            llmConfig: {
                provider: llmConfig.provider,
                endPoint:  './../services/' + type + aiProviders[llmConfig.provider],
                systemPrompt: { 
                    name: (llmConfig.systemPrompt && llmConfig.systemPrompt.name) ? llmConfig.systemPrompt.name : defaults.promptFile,
                    build: false,
                    overwrite: false
                },
                model:  llmConfig.model,
                rules: llmConfig.rules || [],
                examples: llmConfig.examples || []
            }
        };

        return params;
    }


    module.exports = {
        extractParams
    };