Ext.define('Ext.ai.SmartSearch', {
    extend: 'Ext.field.Container',
    xtype: 'ai-smartsearch',

    mixins: [
        "Ext.ai.mixins.AiConn",
        'Ext.ai.mixins.SmartSearchShared'
    ],

    layout: 'hbox',

    /** CHILD ITEMS */
        items: [{
            xtype: 'textfield',
            text: '',
            flex: 1,
            itemId: 'queryField',
            listeners: {
                specialkey: function (obj,e) {
                    let prompt=obj.getValue();
                    if (e.getKey() === e.ENTER || obj.xtype === 'button') {
                        obj.up('ai-smartsearch')._performSearch(obj.up('ai-smartsearch'),prompt);
                    }
                }
            }
        }, {
            xtype: 'button',
            itemId: 'searchButton',
            iconCls: 'x-fa fa-search',
            handler: function (obj, e) { // performs search
                obj.up('ai-smartsearch')._performSearch(obj.up('ai-smartsearch'),obj.prev().getValue());
            }
        }, {
            xtype: 'button',
            itemId: 'resetButton',
            iconCls: 'x-fa fa-ban',
            handler: function (obj, e) { // clears filters
                Ext.Msg.confirm(obj.text || 'Reset Grid', obj.message || '', function (btn) {
                    if (btn==='yes') obj.up('ai-smartsearch')._resetGrid();
                });
            }

        }],

    /**
     * Component Init methods
     */
        /**
         * Modern Toolkit
         */
        initialize: function () {
            this._init();
            this.callParent();
        },


    
});