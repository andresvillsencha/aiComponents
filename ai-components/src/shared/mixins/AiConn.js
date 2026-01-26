Ext.define('Ext.ai.mixins.AiConn', {
    

    config: {
        llmConfig: {
            provider: 'chatgpt',
            model: 'gpt-4o-mini',
            systemPrompt: {
                name: null, // name of the system prompt, if null, it will read the default system prompt, and ignore the build property
            },
            rules: [],  // New rules can be added to the prompt, best practice would be to add it to the system prompt in the backend directly
            examples: [],            
        },
    },


    /**
     * Connects to AI middleware
     * @param {*} connectionObj {
            promptObj: [ Data object with params to be sent ],
            serverUrl: [ Endpoint url ],
            success: [ callback success method ],
            failure: [ callback failure method] // Optional
        };
     */
    _connectToMiddleWare: function (connectionObj) {
        let me=this;

        if (connectionObj.promptObj && typeof connectionObj.serverUrl) {
            // Connect to middleware, send data
                Ext.Ajax.request({
                    url: connectionObj.serverUrl,
                    method: 'POST',
                    jsonData: { 
                        query: connectionObj.promptObj
                    },
                    success: function (response) {
                        if (connectionObj.success!==undefined && connectionObj.success!==null) {
                            let result = Ext.decode(response.responseText);
                            connectionObj.success(result,response);
                        }
                    },
                    failure: function (response) {
                        if (me.config.debug) console.error('Unsuccessfull connection.');
                        if (me.config.showError) {
                            Ext.toast('Connection error: Could connect to Middleware');
                        }
                        if (connectionObj.failure!==undefined && connectionObj.failure!==null) {
                            connectionObj.failure(response);
                        }
                    }
                });
        } else {
            // Missing param
            console.error('Missing parameter. Parameter list must include: promptObj, serverUrl, and callback method: success. Failure is optional');
        }

        
    }
    
});