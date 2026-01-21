Ext.define('AppAi.view.ai.bankingGrid.Panel', {
    extend: 'AppAi.view.ai.MainPanel', 
    xtype: 'banking-grid-panel',

    requires: [
        'AppAi.view.ai.bankingGrid.DataGrid',
        'AppAi.view.ai.bankingGrid.DetailsPanel'
    ],

    layout: {
        type: 'border',
    },

    defaults: {
        split: true,
        bodyPadding: 0
    },
    items: [{
        xtype: 'banking-grid', 
    }, {
        xtype: 'banking-details',
    }],
});