Ext.define('AppComposer.view.composer.assets.GridSetup', {
    extend: 'Ext.form.Panel',
    xtype: 'ai-composer-grid-setup',

    title: 'View Setup',

    requires: [
        'AppComposer.view.composer.assets.VerbSel'
    ],



    layout: {
        type: 'vbox',
        align: 'stretch'
    },

    scrollable: true,

    items: [{
        xtype: 'fieldcontainer',
        layout: 'hbox',
        defaults: {
            margin: '0 5 0 0'
        },
        items: [{
            xtype: 'textfield',
            fieldLabel: 'App Name',
            name: 'AppName',
            emptyText: 'Your App Name',
            value: 'App',
            flex: 2,
            allowBlank: false,
        }, {
            xtype: 'textfield',
            fieldLabel: 'Class Name',
            name: 'ClassName',
            emptyText: 'Your Class Name',
            value: 'MyView',
            flex: 2,
            allowBlank: false,
        }, {
            xtype: 'combobox',
            fieldLabel: 'Toolkit',
            name: 'toolkit',
            queryMode: 'local',
            displayField: 'label',
            valueField: 'value',
            editable: false,
            value: 'classic',
            allowBlank: false,
            store: {
                fields: ['value', 'label'],
                data: [
                    { value: 'classic', label: 'Classic' },
                    { value: 'modern',  label: 'Modern' }
                ]
            },
            flex: 1
        }]
    }, {
        xtype: 'textareafield',
        name: 'tableData',
        fieldLabel: 'SQL Table Description',
        emptyText: 'Enter your SQL create table statement',
        value: "",
        grow: true,
        growMax: 480,
        growMin: 120,
        allowBlank: false,

    }, {
        xtype: 'fieldset',
        title: 'Endpoint Setup',
        padding: 16,
        layout: {
            type: 'hbox',
            align: 'stretch'
        },
        items: [{
            xtype: 'textfield',
            name: 'endpoint',
            fieldLabel: 'GET',
            emptyText: 'Backend url (https://my.server.com/)',
            flex: 2,
            value: 'http://localhost/',
            allowBlank: false,
        }]
    }],

    buttons: [{
        text: 'Generate',
        handler: 'onGenerateGrid'
    },],
});