Ext.define('AppComposer.view.composer.GridC', {
    extend: 'Ext.panel.Panel',
    xtype: 'grid-composer',

    requires: [
        'AppComposer.view.composer.assets.GridSetup',
        'AppComposer.view.composer.assets.ResponsePanel',
        'AppComposer.view.composer.CompController',
    ],

    controller: 'composer-controller',

    title: 'Grid View Composer',

    layout: {
        type: 'border',
        align: 'stretch'
    },


    defaults: {
        collapsible: true,
        split: true,
        bodyPadding: 10
    },

    header: {
        style: {
            backgroundColor: '#369'
        }
    },

    items: [{
        xtype: 'panel',
        reference: 'workarea',
        flex: 1,
        region: 'center',
        layout: 'center',
        bodyStyle: {
            backgroundColor: "#eee"
        },
        collapsible: false,
        scrollable: true,
        items: [{
            xtype: 'tabpanel',
            title: 'Reponse',
            reference: 'view-response',
            width: 800,
            height: 600,
            header: {
                style: {
                    backgroundColor: '#369'
                }
            },
            bodyStyle: {
                backgroundColor: '#fff',
            },
            defaults: {
                bodyPadding: 16,
                bodyStyle: 'white-space:pre; font-family: monospace;',
            },
            items: []
        }]
    }, {
        xtype: 'ai-composer-grid-setup',
        reference: 'view-config',
        width: 620,
        title: 'View Setup',
        region: 'east',
    }]

});