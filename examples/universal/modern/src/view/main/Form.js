Ext.define('App.view.main.Form', {
    extend: 'Ext.Container',
    xtype: 'auto-form',

    requires: [
        'Ext.form.Panel',
        'Ext.field.Text',
        'Ext.field.TextArea',
        'Ext.ai.SmartFillField'
    ],

    fullscreen: true,
    layout: 'center',

    style: {
        backgroundColor: '#ccc'
    },

    items: [{
        xtype: 'formpanel',
        width: 500,
        height: 600,
        scrollable: true,

        style: {
            backgroundColor: '#fff'
        },

        defaults: {
            xtype: 'textfield',
            labelAlign: 'top'
        },

        items: [
            {
                xtype: 'titlebar',
                docked: 'top',
                title: 'Auto Form Example'
            },

            {
                xtype: 'smart-fill-field',
                label: 'Smart Fill',
                placeholder: 'Paste your text here',
                serverUrl: 'http://localhost:3001',
                debug: true,

                llmConfig: {
                    provider: 'anthropic',
                    model: 'claude-sonnet-4-20250514',
                    rules: [
                        'product edition or license should be turned into product_license',
                        'imply the country from the given state'
                    ]
                }
            },

            {
                name: 'firstName',
                label: 'First Name'
            },
            {
                name: 'lastName',
                label: 'Last Name'
            },
            {
                name: 'email',
                label: 'E-mail'
            },
            {
                name: 'phone_number',
                label: 'Phone number'
            },
            {
                name: 'product_name',
                label: 'Product'
            },
            {
                name: 'product_license',
                label: 'License'
            },
            {
                xtype: 'textareafield',
                name: 'fullAddress',
                label: 'Full Address'
            },
            {
                name: 'country',
                label: 'Country'
            },

            {
                xtype: 'toolbar',
                docked: 'bottom',
                items: [
                    { xtype: 'spacer' },
                    {
                        text: 'Submit',
                        ui: 'action'
                    }
                ]
            }
        ]
    }]
});