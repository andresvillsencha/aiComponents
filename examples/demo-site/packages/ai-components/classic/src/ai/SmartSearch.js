/**
 * Ext.ai.SmartSearch (Classic Toolkit)
 *
 * Classic toolkit implementation of the SmartSearch UI.
 * Provides a prompt field + buttons that connect to the Node.js AI middleware
 * via the AiConn mixin, then applies the returned actions to the linked grid.
 *
 * Note:
 * - This class is a thin UI wrapper.
 * - Most behavior is implemented in `Ext.ai.mixins.SmartSearchShared`
 *   to keep Classic and Modern behavior consistent.
 *
 */
Ext.define('Ext.ai.SmartSearch', {
    extend: 'Ext.form.FieldContainer',
    xtype: 'ai-smartsearch',

    mixins: [
        "Ext.ai.mixins.AiConn",
        'Ext.ai.mixins.SmartSearchShared'
    ],

    layout: 'hbox',

    /**
     * Child items
     * - queryField: user natural-language prompt input
     * - searchButton: triggers middleware request
     * - resetButton: resets grid state (filters/sorters/grouping/paging/columns)
     */
        items: [{
            xtype: 'textfield',
            text: '',
            flex: 1,
            itemId: 'queryField',
            listeners: {
                specialkey: function (obj,e) {
                    let prompt=obj.getValue();
                    if (e.getKey() === e.ENTER || obj.xtype === 'button') {
                        obj.up()._performSearch(obj.up(),prompt);
                    }
                }
            }
        }, {
            xtype: 'button',
            itemId: 'searchButton',
            iconCls: 'fa fa-search',
            handler: function (obj, e) { // performs search
                obj.up()._performSearch(obj.up(),obj.prev().getValue());
            }
        }, {
            xtype: 'button',
            itemId: 'resetButton',
            iconCls: 'fa fa-ban',
            handler: function (obj, e) { // clears filters
                Ext.MessageBox.confirm(obj.text || 'Reset Grid', obj.message || '', function (btn) {
                    if (btn==='yes') obj.up().searchBar._resetGrid();
                });
            }

        }],

    /**
     * Classic lifecycle hook.
     * Initializes shared behavior (applies config to field/buttons, sets up features, etc.).
     */
        initComponent: function () { 
            this._init();
            this.callParent();
        },

    
});