Ext.define('AppAi.view.ai.claudeGrid.Panel', {
    extend: 'AppAi.view.ai.MainPanel',
    xtype: 'claude-grid-panel',

    requires: [
        'AppAi.view.ai.claudeGrid.DataGrid',
        'AppAi.view.ai.claudeGrid.DetailsPanel'
    ],

    layout: {
        type: 'border',
    },

    defaults: {
        split: true,
        bodyPadding: 0
    },

    items: [{
        xtype: 'claude-grid', 
    }, {
        xtype: 'claude-grid-details',
    }],
});