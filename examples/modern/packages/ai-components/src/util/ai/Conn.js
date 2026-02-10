/**
 * Class that connects to the AI Middleware
 * 
 */
Ext.define('Ext.util.ai.Conn', {
    singleton: true,

    _defaultConnObj: {
        name: null,
        serverUrl: 'http://localhost/',
        endpoint: 'api/ai-smart',
        success: null,
        failure: null,
        llmConfig: {
            provider: 'chatgpt',
            model: 'gpt-4o-mini',
            systemPrompt: {
                name: 'generic-prompt', // name of the system prompt, if null, it will read the default system prompt, and ignore the build property
            },
            rules: [],  // New rules can be added to the prompt, best practice would be to add it to the system prompt in the backend directly
            examples: [],     
        },
    },

    debug: true,
    _systemMessages: {
        connecting: { text: 'Connecting to AI Middleware', color: '#396'},
        successfull: { text: 'Successfull AI Middleware Connection', color: '#396'},
        unsuccessfull: { text: 'Unsuccessfull AI Middleware Connection', color: '#933'},
    },


    /**
     * Connects to the middleware
     * @param {*} userPrompt 
     * @param {*} connObject 
     * @returns 
     */
    load: function (userPrompt, connObject) {
        let me=this;
        let connObj = me._getConnObj(connObject);
        let promptObj = me._getPromptObj(userPrompt, connObj.llmConfig);
        let url = me._joinUrl(connObj.serverUrl, connObj.endpoint);

        if (promptObj && typeof connObj.serverUrl) {
            // Connect to middleware, send data
                 me._sysMessage('connecting');
                Ext.Ajax.request({
                    url: url,
                    method: 'POST',
                    jsonData: { 
                        query: promptObj
                    },
                    success: function (response) {
                        me._sysMessage('successfull');

                        if (connObj.success!==undefined && connObj.success!==null) {
                            let result = Ext.decode(response.responseText);
                            connObj.success(result,response);
                        }
                    },
                    failure: function (response) {
                        me._sysMessage('unsuccessfull');
                        if (me.config.debug) console.error('Unsuccessfull connection.');
                        if (me.config.showError) {
                            Ext.toast('Connection error: Could connect to Middleware');
                        }
                        if (connObj.failure!==undefined && connObj.failure!==null) {
                            connObj.failure(response);
                        }
                    }
                });
        } else {
            // Missing param
            console.error('Missing parameter. Parameter list must include: promptObj, serverUrl, and callback method: success. Failure is optional');
        }
    },

    /**
     * Prints in console log the messageId
     * @param {*} messageId 
     */
    _sysMessage: function (messageId) {
        let me=this;
        if (me.debug) {
            console.log('%c'+me._systemMessages[messageId].text, '%color:'+me._systemMessages[messageId].color);
        }
    },

    /**
     * Applies default values to connection string
     * @param {*} connString 
     * @returns 
     */
    _getConnObj: function (connObject) {
        let me=this;
        let llmConfig = (connObject.llmConfig!==null && connObject.llmConfig!==undefined) ? connObject.llmConfig : me._defaultConnObj.llmConfig;
        let newConnObject = {
            name: connObject.name || me._defaultConnObj.name || Ext.id(),
            serverUrl: connObject.serverUrl || me._defaultConnObj.serverUrl,
            endpoint: connObject.endpoint || me._defaultConnObj.endpoint,
            success: connObject.success || me._defaultConnObj.success,
            failure: connObject.failure || me._defaultConnObj.failure,
            llmConfig: {
                provider:       (llmConfig.provider!==undefined) ? llmConfig.provider : me._defaultConnObj.llmConfig.provider,
                model:          (llmConfig.model!==undefined) ? llmConfig.model : me._defaultConnObj.llmConfig.model,
                systemPrompt:   (llmConfig.systemPrompt!==undefined) ? llmConfig.systemPrompt : me._defaultConnObj.llmConfig.systemPrompt,
                rules:          (llmConfig.rules!==undefined) ? llmConfig.rules : me._defaultConnObj.llmConfig.rules,  // New rules can be added to the prompt, best practice would be to add it to the system prompt in the backend directly
                examples:       (llmConfig.examples!==undefined) ? llmConfig.examples : me._defaultConnObj.llmConfig.examples,     
            },
        };

        // Fix
            if (typeof newConnObject.llmConfig.systemPrompt === 'string') {
                // Move systemPrompt name to name property
                newConnObject.llmConfig.systemPrompt = {
                    name: newConnObject.llmConfig.systemPrompt
                };
            } else if (typeof newConnObject.llmConfig.systemPrompt.name !== 'string') {
                newConnObject.llmConfig.systemPrompt.name=null;
            }
            

        return newConnObject;
    },

    /**
     * Produces the prompt
     * @param {*} userPrompt 
     * @param {*} llmConfig
     * @returns 
     */
    _getPromptObj: function (userPrompt, llmConfig) {
        let me = this;

        // Let's get the initialConfig
            let promptObj = {
                name: llmConfig.name,
                llmConfig: llmConfig,
                prompt: userPrompt,
            };

        return promptObj;
    },


    _joinUrl: function (a, b) {
        return a.replace(/\/+$/, '') + '/' + b.replace(/^\/+/, '');
    }
});