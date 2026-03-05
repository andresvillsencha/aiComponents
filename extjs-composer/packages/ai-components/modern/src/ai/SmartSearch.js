/**
 * Ext.ai.SmartSearch (Modern Toolkit)
 *
 * Modern toolkit search bar that sends a natural-language prompt to the Node.js AI middleware
 * and applies the returned actions (filters/sorters/grouping/paging/column visibility) to a linked grid.
 *
 * This class is intentionally thin: most logic lives in `Ext.ai.mixins.SmartSearchShared` so that
 * Classic and Modern variants behave consistently.
 *
 */

Ext.define('Ext.ai.SmartSearch', {
    extend: 'Ext.field.Container',
    xtype: 'ai-smartsearch',

    mixins: [
        "Ext.ai.mixins.AiConn",
        'Ext.ai.mixins.SmartSearchShared'
    ],

    layout: 'hbox',

    /**
     * Child items:
     * - queryField: prompt input
     * - searchButton: triggers middleware request
     * - resetButton: clears grid state (filters/sorters/grouping/columns/paging)
     */
        items: [{
            xtype: 'textfield',
            text: '',
            flex: 1,
            itemId: 'queryField',
            listeners: {
                /**
                 * Submit on ENTER.
                 */
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
            /**
             * Click handler: searches using the current textfield value.
             */
            handler: function (obj, e) { 
                obj.up('ai-smartsearch')._performSearch(obj.up('ai-smartsearch'),obj.prev().getValue());
            }
        }, {
            xtype: 'button',
            itemId: 'resetButton',
            iconCls: 'x-fa fa-ban',
            /**
             * Click handler: confirms and then resets the linked grid.
             */
            handler: function (obj, e) { 
                Ext.Msg.confirm(obj.text || 'Reset Grid', obj.message || '', function (btn) {
                    if (btn==='yes') obj.up('ai-smartsearch')._resetGrid();
                });
            }

        }],

        /**
         * Modern toolkit init hook.
         * Delegates to the shared mixin `_init()` to apply config to field + buttons + features.
         */
        initialize: function () {
            this._init();
            this.callParent();
        },


    
});