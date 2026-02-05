Ext.define('Ext.ai.mixins.SmartFillShared', {
   
    aiResponse: null,

    config: {
        name: 'SMARTFILL_'+Ext.id(), // Specify name that will be used for caching
        fieldContainer: null,
        form: null,

        button: {
            hidden: false,
            text: '',
            iconCls: 'x-fa fa-play',
        },
        paste: true,


        debug: false,
        loadingMessage: 'Connecting to AI',

        serverUrl: 'http://www.sencha.com',
        endpoint: '/api/ai-smart-fill',
        
        llmConfig: {
            provider: 'chatgpt',
            model: 'gpt-4o-mini',
            temperature: 0,
            systemPrompt: {
                name: null, // name of the system prompt, if null, it will read the default system prompt, and ignore the build property
            },
            rules: [],  // New rules can be added to the prompt, best practice would be to add it to the system prompt in the backend directly
            examples: [],     
            callback: null,
               
        },
    }, 


    _commit: function (value) {
        let me=this;
        let form = me._getForm();
        if (me.debug) console.log ('%cSending data to AI Middleware','color:#993;');

        let promptObj = me._getPromptObj(form, value);

        if (promptObj.fields!==null && promptObj.fields.length>0) {
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
        } else {
            console.log('%cIt is not possible to perform a AI call if there is no linked form, or no fields are found.',"color:#933;");
        }

        
    },

    /**
     * Due to differences in classic and modern toolkit, the following method get the two child items
     * @param {*} pos 
     * @returns 
     */
    _getItems: function () {
        let me=this;
        return Ext.isClassic ? me.items : me.getItems().items;
    },
    
    _getItem: function (itemId) {
        let me=this;
        let selItem = me._getItems().find(function(item) { return (item.itemId===itemId || (item.getItemId && item.getItemId()===itemId)); });
        
        return selItem;
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
        return me.config.form || me.up('form') || me.up('formpanel') || null;
    },

    /**
     * Gets all fields from the form except the current Smart Fill Field
     * @returns array of fields
     */
    _getFormFields: function () {
        let me=this;
        let form = me._getForm(); 
        let fields = form.query('[isFormField]') || ((form!==undefined && form!==null) ? form.getFields() : []);;
        let fieldsForAI = [];

        if (typeof fields==='object') for (key in fields) {
            let field = fields[key];

            if (me!==field && field.ignoreField!==true) {
                if (Ext.isClassic) {
                    fieldsForAI.push({
                        name: field.getName(),
                        type: 'string',
                        description: field.getFieldLabel()
                    });
                } else if (Ext.isModern) {
                    fieldsForAI.push({
                        name: field.getName(),
                        type: 'string',
                        description: field.getLabel()
                    });

                }
            }
        };
        
        return fieldsForAI;
    },

    _applyFormFields: function (fieldData) {
        let me=this;
        let form = me._getForm(); 
        
        let fields = (form!==undefined && form!==null) ? (Ext.isClassic ? form.getForm() : form) : null;

        if (fields && fieldData) {
            fields.setValues(fieldData);
        }
    }

});