Ext.define('AppAi.view.ai.openAiGrid.Panel', {
    extend: 'AppAi.view.ai.MainPanel', 
    xtype: 'openai-grid-panel',

    requires: [
        'AppAi.view.ai.openAiGrid.DataGrid',
        'AppAi.view.ai.openAiGrid.DetailsPanel'
    ],

    layout: {
        type: 'border',
    },

    defaults: {
        split: true,
        bodyPadding: 0
    },

    items: [{
        xtype: 'openai-grid', 
    }, {
        xtype: 'openai-grid-details',
    }],
});