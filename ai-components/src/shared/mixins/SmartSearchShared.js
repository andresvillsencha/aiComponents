/**
 * Ext.ai.mixins.SmartSearchShared
 *
 * Shared logic for SmartSearch components (Classic + Modern).
 *
 * Responsibilities
 * - Initializes prompt field and buttons based on config
 * - Detects/links a target grid
 * - Builds a prompt payload (prompt + grid fields + LLM config)
 * - Calls the middleware via `Ext.ai.mixins.AiConn`
 * - Applies the middleware response to the grid:
 *   - clear requested features (optional)
 *   - sorters
 *   - filters (gridfilters or gridfilterbar)
 *   - grouping
 *   - column visibility
 *   - paging
 *
 * Middleware request (jsonData)
 * {
 *   query: {
 *     name: "GRID_xxx",
 *     llmConfig: {...},
 *     prompt: "user text",
 *     fields: [{name, type, options?}, ...]
 *   }
 * }
 *
 * Expected middleware response shape (example)
 * {
 *   filters: [...],
 *   sorters: [...],
 *   grouping: { property: "status" },
 *   paging: { page: "next", size: 50 },
 *   columns: { ... },
 *   clear: ["filters","sorters"],
 *   error: null
 * }
 */
Ext.define('Ext.ai.mixins.SmartSearchShared', {
   
    /**
     * Stores the last AI result returned by the middleware for debugging or UI display.
     * @property {Object|null}
     */
    aiResponse: null,

    config: {
        name: 'GRID_'+Ext.id(), // Specify name that will be used for caching
        filedContainer: null,
        store: null,
        grid: null,
        debug: false,
        showError: true,
        serverUrl: 'http://www.sencha.com',
        endpoint: '/api/ai-smart-search',
        llmConfig: {
            provider: 'chatgpt',
            model: 'gpt-4o-mini',
            systemPrompt: {
                name: null, // name of the system prompt, if null, it will read the default system prompt, and ignore the build property
            },
            rules: [],  // New rules can be added to the prompt, best practice would be to add it to the system prompt in the backend directly
            examples: [],     
            /* backend middleware connection */
                loadingMessage: 'Connecting to AI',
                callback: null,       
        },
        /* Text field Options */
            placeholder: 'type your prompt',
            value: null,
            allowBlank: false,

        /**
         * @cfg {Object|Boolean} buttons
         * - Object: per-button configuration
         * - Boolean: show/hide both
         */
            buttons: {
                search: {
                    hidden: false,
                    text: '',
                    iconCls: 'x-fa fa-search',
                },
                reset: {
                    hidden: true,
                    text: '',
                    iconCls: 'x-fa fa-ban',
                    message: 'Reset grid filters'
                }
            },

        /**
         * @cfg {Object} features
         * Controls which response features will be applied.
         */
            features: {
                filtering: true,
                clearFilters: true, // If true, will clear filters before adding new ones
                sorting: true,
                grouping: true,
                paging: true,
                columns: true,
                allowClear: true
            }
    }, 

    /**
     * Public entry point to trigger a search programmatically.
     * Optionally overrides provider/model for this call.
     *
     * @param {String|null} provider
     * @param {String|null} model
     * @param {Function|null} callback inline callback (linkedGrid, result, prompt, fields)
     */
    submit: function (provider=null,model=null,callback=null) {
        let me=this;
        let obj = me._getItemById('queryField');
        
        if (obj!==null && obj.value!=='') {
            // If either provider or model were passed, then update the config
                me.config.llmConfig.provider = (provider!==null) ? provider : me.config.llmConfig.provider;
                me.config.llmConfig.model = (model!==null) ? model : me.config.llmConfig.model;
            me._performSearch(me,obj.getValue(),callback);
        }
    },



    /*****************************
     *      INIT METHODS
     *****************************/
            /**
             * Initializes text field + buttons and applies feature configuration.
             * Called from Classic `beforerender` or Modern `initialize` (wrapper class decides).
             * @private
             */
            _init: function () { 
                let me=this;

                // In Classic, the SmartSearch is often a container with child items.
                // In Modern, the component itself is the container.
                me.fieldContainer=Ext.isClassic ? me.items[0] : me;

                me._setFieldParams(me, me.fieldContainer);

                let aiTextfield=me._getItem(0);
                // Init text field:
                    aiTextfield.emptyText = me.config.placeholder;
                    aiTextfield.text = me.config.value || "";
                    aiTextfield.allowBlank = me.allowBlank;
                    
                // Buttons: support object config or boolean (show/hide both)
                    let aiButton=null;

                    if (me.config.buttons) {
                        // Add Search Button
                            me._setupButton('search', 'searchButton'); // Search button
                            me._setupButton('reset', 'resetButton'); // Search button
                    } else if (me.config.buttons===false || me.config.buttons===true) {
                        if (Ext.isClassic) {
                            me._getItemById('searchButton').hidden=!me.config.buttons;
                            me._getItemById('resetButton').hidden=!me.config.buttons;
                        } else if (Ext.isModern) {
                            me._getItemById('searchButton').setHidden(!me.config.buttons);
                            me._getItemById('resetButton').setHidden(!me.config.buttons);
                        }
                    }

                // Setup features
                    me._setupFeatures();
                
            },

            /**
             * Applies feature defaults merged with user overrides.
             * features: {
             *   filtering: true,
             *   sorting: true,
             *   grouping: true,
             *   paging: true,
             *   columns: true
             * }
             * 
             */
            _setupFeatures: function () {
                let me=this;
                let features = Ext.apply(me.defaultConfig.features,me.config.features);
                let grid = me._getGrid();

                me.config.features=features;
            },

            /**
             * Toolkit-safe item lookup by itemId.
             * @param {String} itemId
             * @return {Ext.Component|null}
             * @private
             */
            _getItemById: function (buttonId) {
                let me=this;
                let items = me._getItems();
                let button = items.find(function(item) { 
                    return (
                        item.itemId===buttonId 
                        || (item.getItemId && item.getItemId()===buttonId)
                    ); 
                });

                return (button!==undefined) ? button : null;
            },

            /**
             * Applies per-button configuration to the underlying button component.
             * @param {String} type "search" | "reset"
             * @param {String} buttonId itemId of the button component
             * @return {Ext.Component|null}
             * @private
             */
            _setupButton: function (type, buttonId) {
                let me=this;
                let button = me._getItemById(buttonId);
                let userActionConfig = (
                        typeof me.config.buttons[type]==='object'  
                        ? Ext.clone(me.config.buttons[type])            // Gets object
                        :   (
                                typeof me.config.buttons[type]==='boolean'  
                                ? { hidden: !me.config.buttons[type] }   // gets hidden and turns into an object
                                : { }                                   // gets empty
                            )
                );
                let actionConfig = Ext.clone(me.defaultConfig.buttons[type] || {});

                if (button!==undefined && button!==null) {
                    Ext.apply(actionConfig,userActionConfig);
                    // Classic allows direct apply for many props; Modern prefers setters.
                    if (Ext.isClassic) {
                        Ext.apply(button,actionConfig);
                    } else {
                        button.setHidden(actionConfig.hidden);
                        button.setText(actionConfig.text);
                        button.setIconCls(actionConfig.iconCls);
                        button.message=actionConfig.message;
                    }
                }
                // Convenience backlink for handlers
                    button.smartSearch=me;
                
                return button;
            },

            /**
             * Copies common presentation params from the SmartSearch component to the internal container.
            * @param {*} me 
             * @param {*} fieldContainer 
             * @returns 
             */
            _setFieldParams: function (me, fieldContainer) {
                let params = "width,height,padding,margin,cls,style,userCls,config,listeners".split(",");

                for (let key in params) {
                    let param = params[key];
                    if (me[param]!==undefined) fieldContainer[param]=me[param];
                }
                return fieldContainer;
            },


            /**
             * Toolkit-safe positional item getter.
             * @private
             */
            _getItem: function (pos) {
                let me=this;
                let items = Ext.isClassic ? me.items : me.getItems().items;
                
                return items[pos];
            },

            /**
             * Toolkit-safe items array getter.
             * @returns 
             * @private
             */
            _getItems: function () {
                let me=this;
                return Ext.isClassic ? me.items : me.getItems().items;
            },

    /**************************
     *      SEARCH METHODS
     **************************/

            /**
             * Attempts to resolve the linked grid, either from config or by climbing the component tree.
             * @return {Ext.grid.Panel|Ext.grid.Grid|null}
             * @private
             */
            _getGrid: function () {
                let me=this;

                return (me.config.grid!==null && me.config.grid!==undefined) ? me.config.grid : me.up('grid');
            },

            /**
             * Main entry point called by the UI.
             * - Validates prompt
             * - Builds prompt object from grid columns
             * - Calls middleware via AiConn mixin
             * - Processes response into grid actions
             *
             * @param {Ext.Component} fieldcontainer
             * @param {String} userPrompt
             * @param {Function|null} inlineCallback
             * @private
             */
            _performSearch: function (fieldcontainer,userPrompt,inlineCallBack) {
                let me=this;
                // get the linked grid
                    let linkedGrid = me._getGrid();
                // get the text field
                    let textField = fieldcontainer.down('#queryField');

                if (!textField.validate()) {
                    // Validate the prompt is not empty
                        if (me.config.debug) console.error('Can\'t send an empty an empty prompt');
                } else if (linkedGrid!==null) {
                    // Construct the prompt Object
                        let promptObj = me._getPromptObj(linkedGrid,userPrompt);
                    
                    // Mask the grid
                        linkedGrid.mask(me.config.loadingMessage);
                    // Let's connect
                        if (me.config.debug) { console.log('%cPrompt Object: ','color:#993;'); console.log(promptObj); };

                        me._connectToMiddleWare({
                            promptObj: promptObj,
                            serverUrl: me.config.serverUrl + me.config.endpoint,
                            success: function (result, fullResponse) {
                                linkedGrid.unmask();

                                try {
                                    if (me.config.debug) { console.log('%cAi Response:','color:#993;'); console.log(result) };
                                    if (result.error===undefined || result.error===null) {
                                        me._processResponse(linkedGrid,result);
                                    } else {
                                        if (me.config.debug) console.log('Could not process prompt: '+result.error);
                                        if (me.config.showError) {
                                            Ext.toast('Response: '+result.error, 'Could not process prompt');
                                        }
                                    }

                                    me.aiResponse = result; // Save result inside the component, this will be helpfull if the user wants to show the response in a window

                                    // Call Callback method if set, return the result, the original prompt, and the recovered fields
                                        if (me.config.callback!==null && me.config.callback!==undefined) me.config.callback(linkedGrid, result, promptObj.prompt, promptObj.fields);
                                        if (inlineCallBack!==null && inlineCallBack!==undefined) inlineCallBack(linkedGrid, result, promptObj.prompt, promptObj.fields);
                                } catch (err) {
                                    if (me.config.debug) console.error('Error decoding response.');
                                }
                                
                            }, 
                            failure: function (response) {
                                linkedGrid.unmask();
                                if (me.config.debug) console.error('Unsuccessfull connection.');
                                if (me.config.showError) {
                                    Ext.toast('Connection error: Could connect to Middleware');
                                }
                            }
                        });
                } else {
                    if (me.config.debug) console.error('Search bar must be inside a grid toolbar or linked to a grid for the component to work');
                }
            },


    /*****************************
     * RESET / CLEAR GRID FEATURES
     *****************************/

            /**
             * Resets the linked grid state:
             * - clears filters
             * - clears sorters
             * - clears grouping
             * - resets page size
             * - shows all columns
             * @private
             */
            _resetGrid: function () {
                let me=this;
                let grid = me._getGrid();

                let filtersPlugin = me._getPluginType(grid);
                let store = grid.getStore();

                if (filtersPlugin.active) {
                    if (filtersPlugin.type==='gridfilters' && me.config.clearFilters) {
                        filters.clearFilters();
                    } else if (filtersPlugin.type==='gridfilterbar' && store.clearFilter) {
                        store.clearFilter(true);
                    }
                }
                if (store) {
                    store.setPageSize(store.getInitialConfig('pageSize'));
                    store.clearGrouping();
                    store.sorters.clear();
                }
                // show all columns
                    if (Ext.isClassic) {
                        Ext.Array.forEach(grid.getColumnManager().getColumns(), function(col) {
                            col.setHidden(false);
                        });
                    } else if (Ext.isModern){
                        Ext.Array.forEach(grid.getColumns(), function (col) {
                            col.setHidden(false);
                        });
                    }

                store.load();
            },

            /**
             * Clears only the requested features (used when middleware returns `clear: [...]`).
             * Supported values: filters, sorters, grouping, paging, columns
             * @param {String[]} features
             * @param {Boolean} reload
             * @private
             */
            _clearFeatures: function (features, reload) {
                let me=this;
                let grid = me._getGrid();
                let loadStore = !!reload;

                let filters = me._getPlugin(grid);
                let store = grid.getStore();

                if (features.indexOf('filters')>=0 && filters) {
                    if (filters.clearFilters) {
                        filters.clearFilters();
                    } else if (store.clearFilter) {
                        store.clearFilter(true);
                    }
                }
                if (store) {
                    if (features.indexOf('sorters')>=0) store.sorters.clear();
                    if (features.indexOf('grouping')>=0) store.clearGrouping();
                    if (features.indexOf('paging')>=0) store.setPageSize(store.getInitialConfig('pageSize'));
                }
                if (features.indexOf('columns')>=0) {
                    Ext.Array.forEach(grid.getColumnManager().getColumns(), function(col) {
                        col.setHidden(false);
                    });
                }
                if (load) store.load();
                
            },

    /*****************************
     * PROMPT BUILDING (GRID META)
     *****************************/
            /**
             * Builds the prompt object sent to middleware.
             * @private
             */
            _getPromptObj: function (linkedGrid,userPrompt) {
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
                        fields: me._getColumns(linkedGrid), // retreives the columns from the grid, to be used by the middleware
                    };

                return promptObj;
            },

            /**
             * Extracts grid columns into a simplified list for the middleware.
             * Each field includes:
             * - name: dataIndex
             * - type: filter type (string/number/date/list/etc)
             * - options: (optional) list options for list filters
             *
             * @private
             */
            _getColumns: function (linkedGrid) {
                let me=this;
                let columns = linkedGrid.getColumns();
                let fields = [];
                let filterType = me._getPluginType(linkedGrid);
                me.listOptions={};

                // Loop through the columns
                Ext.Array.each(columns, function (col) {
                    // Filters are obtained in a different way in classic and modern toolkits
                    let filter = null;
                    
                    switch (filterType.type) {
                        case 'gridfilters': 
                            filter =  
                                (Ext.isClassic) 
                                    ? ((col.filter!==undefined && col.filter!==null) ? col.filter : false)
                                    : ((col.getFilter()!==undefined && col.getFilter()!==null) ? col.getFilter() : false);
                            break;
                        case 'gridfilterbar': 
                            filter =  
                                (Ext.isClassic) 
                                    ? ((col.filterType!==undefined && col.filterType!==null) ? col.filterType : false)
                                    : ((col.getFilterType()!==undefined && col.getFilterType()!==null) ? col.getFilterType() : false);
                            break;
                    }

                    let field = {
                        name: (Ext.isClassic) ? col.dataIndex : col.getDataIndex(),
                        type: Ext.isObject(filter) ? filter.type : filter
                    };

                    // If the filter is of type list, let's try and retreive the list
                    // this works best if the options are hardcoded or come from a store
                        if (field.type==='list') {
                            field.options = (filter && Ext.isObject(filter) && filter.options!==undefined) ? filter.options : null;
                            if (field.options===null) {
                                field.options = Ext.Array.unique(linkedGrid.getStore().collect(field.name)); // get the list from the grid
                            }
                        }
                    // Filter only if it has an available filter
                        if (field.type!==false) {
                            fields.push(field);
                            me.listOptions[field.name]=field;
                        }
                }); 

                return fields;
            },

            
    /**********************************
     *      RESPONSE PROCESSING
     **********************************/
            /**
             * Applies a middleware response to the linked grid while respecting feature flags.
             * 
             * @param {*} linkedGrid 
             * @param {*} result 
             */
            _processResponse: function (linkedGrid,result) {
                let me=this;
                let plugin = me._getPluginType(linkedGrid); // Get filter plugin
                let gridStore = (me.config.store!==null) ? me.config.store : (linkedGrid.store ? linkedGrid.store : null); // get grid store
                let features = me.config.features;
                // STEP 0. If action is set
                    if (features.allowClear && result.clear!==undefined && Array.isArray(result.clear) && result.clear.length>0) {
                        me._clearFeatures(result.clear);
                    }

                // STEP 1. Apply new sorters
                    if (features.sorting && (result.sorters && gridStore!==null && Array.isArray(result.sorters) && result.sorters.length>0)) {
                        gridStore.sort(result.sorters);
                    }

                // STEP 2. Apply new Filters
                    if (features.filtering && (result.filters && Array.isArray(result.filters))) {
                        if (plugin.active) {
                            // Apply filters
                                if (plugin.type==='gridfilters') {
                                    plugin.plugin=me._applyFiltersGF(plugin.plugin,result.filters);
                                } else if (plugin.type==='gridfilterbar') {
                                    me._applyFiltersFB(linkedGrid,result.filters);
                                }
                                
                        } else {
                            if (me.config.debug) console.error('Must have active filters in the grid for the NL search to work.');
                        }
                    }

                // STEP 3. Apply new grouping
                    if (features.grouping && result.grouping) {
                        me._grouping(linkedGrid,gridStore,result.grouping);
                    } else if (features.grouping===false) {
                        me._groupClear(linkedGrid,gridStore);
                    }

                // STEP 4. Column visibility, only if parameters are correct and if the column exists
                    if (features.columns && (typeof result.columns === 'object') && result.columns) {
                        me._columnVisibility(linkedGrid,result.columns);
                    }

                // STEP 5. Apply page change
                    if (features.paging && me._getPaging(linkedGrid) && result.paging) {
                        me._setPaging(linkedGrid,gridStore,result.paging);
                    }
                    
            },

            /**
             * Detects which filtering plugin is active on the grid.
             * @private
             * @param {*} linkedGrid 
             * @returns 
             */
            _getPluginType: function (linkedGrid) {
                let me=this;
                let plugin = {
                    plugin: null,
                    type: '',
                    parameter: '',
                    active: false
                };

                if (linkedGrid.getPlugin('gridfilters')) {
                    plugin = {
                        plugin: linkedGrid.getPlugin('gridfilters'),
                        type: 'gridfilters',
                        parameter: 'filter',
                        active: true
                    };
                } else if (linkedGrid.getPlugin('gridfilterbar')) {
                    plugin = {
                        plugin: linkedGrid.getPlugin('gridfilterbar'),
                        type: 'gridfilterbar',
                        parameter: 'filtertype',
                        active: true
                    };
                } 

                return plugin;
            },

            /**
             * Recovers the active filter plugin. This searchbar only works if either the 
             * - gridfilters
             * - gridfilterbar
             * is active
             * @param {*} linkedGrid The linked grid
             * @returns object plugin
             */
            _getPlugin: function (linkedGrid) {
                let me=this;
                let plugin = null;

                // Gets grid filters plugin
                    plugin = linkedGrid.getPlugin('gridfilters');
                // if not found, get the grid filter bar plugin
                    if (!plugin) {
                        plugin = linkedGrid.getPlugin('gridfilterbar');
                    }
                // if not found, then do nothing with filters
                    if (!plugin) {
                        plugin=null;
                        if (me.config.debug) console.log('%cThe Smart Search Component requires either the gridfilters or the gridfilterbar plugin to work correctly','color: #933;');
                    }

                return plugin;
            },


            /**
             * Sanitizes dates by making sure they are in a valid format. 
             * Dates from the middle ware will come as yyyy/mm/dd
             * This method will convert them into valid dates
             * @param {*} value 
             * @returns 
             * @private
             */
            _sanitizeDate: function (value) {
                if (value.gt!==undefined) value.gt=new Date(value.gt);
                if (value.lt!==undefined) value.lt=new Date(value.lt);
                if (value.eq!==undefined) value.eq=new Date(value.eq);
                return value;
            },

            
            /**
             * Converts middleware operator tokens into store-friendly operators.
             * null if not valid
             * @param {*} op 
             * @returns 
             * @private
             */
            _getOperator: function (op) {
                switch (op) {
                    case '>': case 'gt':
                        return '>';
                    case '>=': case 'gte':
                        return '>=';
                    case '<': case 'lt':
                        return '>';
                    case '<=': case 'lte':
                        return '>=';
                    case '=': case 'eq': case 'is':
                        return '=';
                    case '<>': case 'neq': case '!=':
                        return '!=';
                }
                return null;
            },



    /************
     * FILTERING
     ************/

        /**
         * Applies filters using the gridfilters plugin.
         * - Classic: plugin.addFilter([...])
         * - Modern: plugin.setActiveFilter([...])
         * 
         * @param {*} plugin 
         * @param {*} filters 
         * @private
         */
        _applyFiltersGF: function (plugin,filters) {
            let me=this;
            let filterArray=[];

            // In classic, plugin requires to clear the existing filters
            if (Ext.isClassic) {
                plugin.clearFilters();
            }
            
            Ext.Array.forEach(filters, function (filter) {
                // We will get the column data. This will be used for several things:
                // 1. If filter is of type list, we will need to get the options to avoid an issue where the options are modified
                // 2. Sometimes, the LLM model might change the filter type. We need the real filter type, and not the one that comes from the LLM
                    let filterCfg = me.listOptions[filter.property];

                    if (filterCfg!==undefined) {
                        // Dates coming from the response have not been correctly formatted, 
                        // the following statement fixes it to make it work correctly
                            if (filterCfg.type==="date") {
                                filter.value=me._sanitizeDate(filter.value);
                            }

                            if (Ext.isClassic) {
                                filterArray.push({
                                    dataIndex: filter.property,
                                    type: filterCfg.type || filter.type, // fix filter type change from LLM
                                    operator: filter.operator,
                                    value: filter.value,
                                    options: filterCfg.options || [] // will fix an issue with options on a list filter
                                });
                            } else {
                                let newFilters = me._getFilterCfg(filter);
                                for (let key in newFilters) {
                                    filterArray.push(newFilters[key]);
                                }
                            }
                    } else {
                        if (me.config.debug) console.log('%cFilter '+filter.property+" not found","color:#933;");
                    }

                
                });
                if (filterArray.length>0) {
                    if (Ext.isClassic) {
                        plugin.addFilter(filterArray);
                    } else {
                        plugin.setActiveFilter(filterArray);
                    }
                }
            return plugin;
        },

        /**
         * Transforms middleware filters into modern-friendly filter objects.
         * @param {*} filter 
         * @returns 
         */
        _getFilterCfg: function (filter) {
            let filterCfg = [];
            let operators = {
                "gt": ">",
                "lt": "<",
                "gte": ">",
                "lte": "<",
                "eq": "=",
                "is": "=",
                "like": "like"
            };

            if (!Array.isArray(filter.value) && typeof filter.value === 'object') {
                for (let op in filter.value) {
                    let value = filter.value[op];
                    let oper = operators[op] || "=";
                    filterCfg.push({
                        property: filter.property,
                        // type: filter.type || 'number',
                        operator: oper,
                        value: value
                    });
                }
            } else {
                filterCfg=[{
                    property: filter.property,
                    // type: filter.type || 'string',
                    operator: filter.operator || 'like',
                    value: filter.value
                }];
            }

            return filterCfg;
        },

        /**
         * Applies filters using the gridfilterbar plugin (store-level filtering).
         * @param {*} linkedGrid 
         * @param {*} filters 
         * @returns 
         */
        _applyFiltersFB: function (linkedGrid,filters) {
            let me=this;
            let store=linkedGrid.store;

            // In classic, plugin requires to clear the existing filters
            store.clearFilter(true);
            
            Ext.Array.forEach(filters, function (filter) {
                // We will get the column data. This will be used for several things:
                // 1. If filter is of type list, we will need to get the options to avoid an issue where the options are modified
                // 2. Sometimes, the LLM model might change the filter type. We need the real filter type, and not the one that comes from the LLM
                    let filterCfg = me.listOptions[filter.property];

                    if (filterCfg!==undefined) {
                        // Dates coming from the response have not been correctly formatted, 
                        // the following statement fixes it to make it work correctly
                            if (filterCfg.type==="date") {
                                filter.value=me._sanitizeDate(filter.value);
                            }

                            if (Ext.isClassic) {
                                if (typeof filter.value==='object') {
                                    for (let key in filter.value) {
                                        let val = filter.value[key];
                                        let op = me._getOperator(key);
                                        
                                        if (op!==null) {
                                            store.addFilter({
                                                property: filter.property,
                                                type: filterCfg.type || filter.type, // fix filter type change from LLM
                                                operator: op,
                                                value: val
                                            });
                                        }
                                    }

                                } else {
                                    store.addFilter({
                                        property: filter.property,
                                        type: filterCfg.type || filter.type, // fix filter type change from LLM
                                        operator: filter.operator,
                                        value: filter.value,
                                        options: filterCfg.options || [] // will fix an issue with options on a list filter
                                    });
                                }
                            } else {
                                store.addFilter({
                                    property: filter.property,
                                    value: filter.value,
                                    operator: filter.operator
                                });
                            }
                    } else {
                        if (me.config.debug) console.log('%cFilter '+filter.property+" not found","color:#933;");
                    }
                });
                store.load();
        },

    /************
     * GROUPING
     ************/
        /**
         * Gets the type of grouping
         * 
         * @param {*} linkedGrid 
         * @returns 
         */
        _getGrouping: function (linkedGrid) {
            let groupingft = (linkedGrid.features!==undefined) ? Ext.Array.findBy(linkedGrid.features, function (f) {
                return f.ftype === 'grouping' || f.ftype === 'groupingsummary';
            }) : null;
            return ((groupingft!==undefined && groupingft!==null) || Ext.isModern);
        },

        /**
         * Perform grouping
         * @param {*} linkedGrid 
         * @param {*} gridStore 
         * @param {*} grouping 
         */
        _grouping: function (linkedGrid, gridStore, grouping) {
            let me=this;
            if (Ext.isClassic && linkedGrid.features!==undefined) {
                // Classic toolkit, grouping is performed by using features
                // Search for grouping feature
                    if (me._getGrouping(linkedGrid)) {
                        me._groupClear(linkedGrid,gridStore);
                        if (grouping!==false && grouping.property!==undefined)
                        me._groupBy(gridStore,grouping.property);
                    } else {
                        if (me.config.debug) console.error('NL grouping cannot be applied if the grid does not have the grouping feature active');
                    }
            } else if (Ext.isModern) {
                // Modern
                
                me._groupByModern(linkedGrid,gridStore,grouping.property);
            }
        },

        /**
         *  Groups by specified field
         * @param {*} gridStore 
         * @param {*} fieldName 
         */
        _groupBy: function (gridStore,fieldName) {
            gridStore.group(fieldName);
        },

        /**
         *  Groups by specified field
         * @param {*} gridStore 
         * @param {*} fieldName 
         */
        _groupByModern: function (grid,gridStore,fieldName) {
            gridStore.setGrouper({
                property: fieldName,     // <-- your field
                direction: 'ASC'
                // groupFn: rec => rec.get('status') // optional if you need custom grouping
            });

            if (grid.setGrouped) {
                grid.setGrouped(true);
            } else {
                grid.grouped = true; 
            }
        },

        /**
         * Clears grouping
         * @param {*} gridStore 
         */
        _groupClear: function (grid,gridStore) {
            if (Ext.isClassic) {
                gridStore.clearGrouping();
            } else {
                if (grid.setGrouped) {
                    grid.setGrouped(false);
                } else {
                    grid.grouped = false; 
                }
            }
        },

    /********************
     * COLUMN VISIBILITY
     ********************/

        /**
         * Shows/hides columns by dataIndex / dataIndex-like property.
        * Supports Classic and Modern.
        *
        * columnResponse example:
        * {
        *   col1: { property: "status", hidden: true },
        *   col2: { property: "email", hidden: false }
        * }
        * @param {*} linkedGrid 
        * @param {*} columnResponse 
        *  @private
        */
        _columnVisibility: function (linkedGrid, columnResponse) {
            for (let key in columnResponse) {
                if (columnResponse.hasOwnProperty(key)) {
                    let element = columnResponse[key];
                    if (element && element.property!==undefined && element.hidden!==undefined && typeof element.hidden==='boolean') {
                        let column = linkedGrid.down(`gridcolumn[dataIndex=${element.property}]`);
                        if (column) {
                            column.setHidden(element.hidden);
                        }
                    }
                }
            }
        },


/********
 * PAGING
 ********/

        _getPaging: function (linkedGrid) {
            let pagingtb = linkedGrid.down('pagingtoolbar');
            return (pagingtb!==undefined && pagingtb!==null);
        },

        /**
         * Sets the grid's paging. It can change the page size, and the current page
         * @param {*} store 
         * @param {*} paging 
         */
        _setPaging: function (linkedGrid, store, paging) {
            let me=this;
            if (paging!==null && paging!==undefined) {
                let pagingtb = linkedGrid.down('pagingtoolbar');

                if (me._getPaging(linkedGrid)) {
                    // Paging
                        if (paging.page) me._changePage(store,paging.page);
                    // Page Size
                        if (paging.size) me._changePageSize(store,paging.size);
                } else {
                    if (me.config.debug) console.log('%cNL page switching cannot be performed if the grid does not have pagination active','color:#660;');
                }
            }
        },

        /**
         * Change the page size
         * @param {*} store 
         * @param {*} page 
         */
        _changePage: function (store,page) {
            let last = Math.floor((store.getTotalCount()-1)/store.getPageSize())+1;
            switch (page) {
                case 'prev': case 'previous':
                    store.previousPage();
                    break;
                case 'next':
                    store.nextPage();
                    break;
                case 'first':
                    store.loadPage(1);
                    break;
                case 'last':
                    store.loadPage(last);
                    break;
                default:
                    let pagNumber=parseInt(page);
                    if (pagNumber<=0) pagNumber=1;
                    if (pagNumber>last) pagNumber=last;
                    store.loadPage(pagNumber);
                    break;
            }
        },

        /**
         * Change the page size
         * @param {*} store 
         * @param {*} pageSize 
         */
        _changePageSize: function (store,pageSize) {
            pageSize=parseInt(pageSize);
            if (pageSize<=0) pageSize=1;
            store.setPageSize(pageSize);
            store.loadPage(1);
        },
});