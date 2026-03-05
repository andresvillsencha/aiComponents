/**
 * Ext.util.ai.Conn
 * ----------------
 * Simple singleton wrapper around Ext.Ajax to call an "AI Middleware" endpoint.
 *
 * Responsibilities:
 * - Merge a user-provided connObject with defaults
 * - Build a payload ("promptObj") that includes llmConfig + user prompt + optional params
 * - POST to serverUrl + endpoint
 * - Route success/failure to provided callbacks
 */

Ext.define('Ext.util.ai.Conn', {
    singleton: true,

    /**
     * Default config used when caller does not provide values.
     * NOTE: This is currently a plain object; no formal Ext JS config system is used.
     */
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
                // If null, backend will use default system prompt
                name: 'generic-prompt', 
            },
            // Optional prompt modifiers (prefer keeping these server-side for governance)
            rules: [],  
            examples: [],     
        },
    },

     /**
     * Controls console messages.
     * NOTE: you also reference me.config.debug later, but there is no config block.
     */
    config: {
        debug: true,
        showError: true,
    },

    /**
     * UI/console status messages
     */
    _systemMessages: {
        connecting:     { text: 'Connecting to AI Middleware', color: '#396'},
        successfull:    { text: 'Successfull AI Middleware Connection', color: '#396'},
        unsuccessfull:  { text: 'Unsuccessfull AI Middleware Connection', color: '#933'},
        missingParams:  { text: 'Missing parameters. Could not connect', color: '#933'},
    },


    /**
     * Connects to the middleware
     * @param {*} userPrompt   String (or whatever your backend expects)
     * @param {*} connObject   Object with serverUrl/endpoint/callbacks/llmConfig overrides
     * @param {*} params       Optional extra params sent to middleware
     */
    load: function (userPrompt, connObject, params=undefined) {
        let me=this;
        // Merge defaults with caller overrides
        let connObj = me._getConnObj(connObject);
        // Create payload for middleware
        let promptObj = me._getPromptObj(userPrompt, connObj.llmConfig, params);

        // Validation
        if (promptObj && typeof connObj.serverUrl === 'string' && connObj.serverUrl.length > 0) {
            // Build final URL
                let url = me._joinUrl(connObj.serverUrl, connObj.endpoint);

            // Connect to middleware, send data
                me._sysMessage('connecting');

                Ext.Ajax.request({
                    url: url,
                    method: 'POST',

                    // Payload sent to server. Backend receives { query: { ... } }
                    jsonData: { 
                        query: promptObj
                    },
                    success: function (response) {
                        me._sysMessage('successfull');

                        // Only decode/dispatch if success callback is provided
                        if (connObj.success!==undefined && connObj.success!==null) {
                            let result = Ext.decode(response.responseText);
                            connObj.success(result,response);
                        }
                    },
                    failure: function (response) {
                        me._sysMessage('unsuccessfull');
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
            me._sysMessage('missingParams');
        }
    },

    /**
     * Prints in console log the messageId
     * @param {*} messageId 
     */
    _sysMessage: function (messageId) {
        let me=this;
        if (me.debug) {
            console.log('%c'+me._systemMessages[messageId].text, 'color:'+me._systemMessages[messageId].color);
        }
    },

    /**
     *  Produces a normalized connection object by applying defaults.
     * - Ensures llmConfig exists
     * - Normalizes llmConfig.systemPrompt to an object { name }
     * @param {*} connString 
     * @returns 
     */
    _getConnObj: function (connObject) {
        let me=this;

        // Use provided llmConfig or default
        let llmConfig = (connObject.llmConfig!==null && connObject.llmConfig!==undefined) ? connObject.llmConfig : me._defaultConnObj.llmConfig;

        // Build a new object with fallback values
        let newConnObject = {
            name: connObject.name || me._defaultConnObj.name || Ext.id(),
            serverUrl: connObject.serverUrl || me._defaultConnObj.serverUrl,
            endpoint: connObject.endpoint || me._defaultConnObj.endpoint,
            success: connObject.success || me._defaultConnObj.success,
            failure: connObject.failure || me._defaultConnObj.failure,
            llmConfig: {
                provider: (llmConfig.provider!==undefined) 
                        ? llmConfig.provider 
                        : me._defaultConnObj.llmConfig.provider,
                model: (llmConfig.model!==undefined) 
                        ? llmConfig.model 
                        : me._defaultConnObj.llmConfig.model,
                systemPrompt: (llmConfig.systemPrompt!==undefined) 
                        ? llmConfig.systemPrompt 
                        : me._defaultConnObj.llmConfig.systemPrompt,
                rules: (llmConfig.rules!==undefined) 
                        ? llmConfig.rules 
                        : me._defaultConnObj.llmConfig.rules,  // New rules can be added to the prompt, best practice would be to add it to the system prompt in the backend directly
                examples: (llmConfig.examples!==undefined) 
                        ? llmConfig.examples 
                        : me._defaultConnObj.llmConfig.examples,     
            },
        };

        // Normalize systemPrompt:
        // - If string: treat as the name
        // - If object but name is not a string: set name null
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
     * Produces the prompt payload object expected by your middleware.
     * NOTE: llmConfig.name doesn't exist in your defaults, so promptObj.name will be undefined.
     * @param {*} userPrompt 
     * @param {*} llmConfig
     * @returns 
     */
    _getPromptObj: function (userPrompt, llmConfig, params=undefined) {
        let me = this;

        // Let's get the initialConfig
            let promptObj = {
                name: llmConfig.name,
                llmConfig: llmConfig,
                prompt: userPrompt,
                params: params || undefined
            };

        return promptObj;
    },


    /**
     * Join server base + endpoint safely:
     * - removes trailing slashes from base
     * - removes leading slashes from endpoint
     */
    _joinUrl: function (part1, part2) {
        return part1.replace(/\/+$/, '') + '/' + part2.replace(/^\/+/, '');
    }
});