Ext.define('Ext.ai.mixins.SmartFillShared', {
   
    aiResponse: null,

    config: {
        name: 'SMARTFILL_'+Ext.id(), // Specify name that will be used for caching
        fieldContainer: null,
        form: null,
        autorun: true,
        debug: false,
        loadingMessage: 'Connecting to AI',
        
        llmConfig: {
            provider: 'chatgpt',
            model: 'gpt-4o-mini',
            systemPrompt: {
                name: null, // name of the system prompt, if null, it will read the default system prompt, and ignore the build property
            },
            rules: [],  // New rules can be added to the prompt, best practice would be to add it to the system prompt in the backend directly
            examples: [],     
            /* backend middleware connection */
                serverUrl: 'http://www.sencha.com',
                endpoint: '/api/endpoint',
                callback: null,
        },
    }, 


    _commit: function (value) {
        let me=this;
        let form = me._getForm();
        if (me.debug) console.log ('%cSending data to AI Middleware','color:#993;');

        let promptObj = me._getPromptObj(form, value);

        form.mask(me.config.loadingMessage);

        me._connectToMiddleWare({
            promptObj: promptObj,
            serverUrl: me.config.serverUrl + me.config.endpoint,
            success: function (response, fullResponse) {
                form.unmask();
                if (response && response.success && response.data) {
                    if (me.debug) console.log ('%cAI Middleware Response received correctly','color:#993;');
                    me._applyFormFields(response.data);
                } else {
                    if (me.debug) console.log('%cCould not process data. Invalid response from middleware server.');
                }
            }, 
            failure: function (response) {
                form.unmask();
                if (me.debug) console.log('%cCould not process data. Middleware server did not response.');
            }
        });
    },


    /**
     * Creates the prompt object
     * @param {*} linkedForm 
     * @param {*} userPrompt 
     * @returns 
     */
    _getPromptObj: function (linkedForm, userPrompt) {
        let me=this;
        let systemPrompt = me.config.llmConfig.systemPrompt || {}; // get the system prompt

        // Let's get the systemprompt
            // if only the name was specified
                let sysPromptName = (typeof systemPrompt === 'string') ? systemPrompt : (systemPrompt.name || null);
                systemPrompt = {
                    name: sysPromptName,
                };


        // Let's get the initialConfig
            let promptObj = {
                name: me.config.name,
                llmConfig: {
                    provider:  me.config.llmConfig.provider || me.initialConfig.llmConfig.provider,
                    model:  me.config.llmConfig.model || me.initialConfig.llmConfig.model,
                    systemPrompt:  systemPrompt,
                    rules: me.config.llmConfig.rules || [],
                    examples: me.config.llmConfig.examples || []
                },
                prompt: userPrompt,
                fields: me._getFormFields(linkedForm), // retreives the columns from the grid, to be used by the middleware
            };

        return promptObj;
    },


    /**
     * Gets the linked form, or the parent form
     * @returns form or null if not found
     */
    _getForm: function () {
        let me=this;
        return me.config.form || me.up('form') || null;
    },

    /**
     * Gets all fields from the form except the current Smart Fill Field
     * @returns array of fields
     */
    _getFormFields: function () {
        let me=this;
        let form = me._getForm(); 
        let fields = (form!==undefined && form!==null) ? form.getForm().getFields() : [];
        let fieldsForAI = [];
        
        fields.each(function (field) {
            if (me!==field) {
                fieldsForAI.push({
                    name: field.getName(),
                    type: 'string',
                    description: field.getFieldLabel()
                });
            }
        });
        return fieldsForAI;
    },

    _applyFormFields: function (fieldData) {
        let me=this;
        let form = me._getForm(); 
        let fields = (form!==undefined && form!==null) ? form.getForm() : null;

        if (fields && fieldData) {
            fields.setValues(fieldData);
        }
    }

});