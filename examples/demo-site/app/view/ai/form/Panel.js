Ext.define('AppAi.view.ai.form.Panel', {
    extend: 'AppAi.view.ai.MainPanel',
    xtype: 'form-grid-panel',

    requires: [
        'AppAi.view.ai.form.AutoForm',
        'AppAi.view.ai.form.DetailsPanel'
    ],

    layout: {
        type: 'border',
    },

    defaults: {
        split: true,
        bodyPadding: 0
    },

    items: [{
        xtype: 'auto-form', 
    }, {
        xtype: 'auto-form-details',
    }],
});