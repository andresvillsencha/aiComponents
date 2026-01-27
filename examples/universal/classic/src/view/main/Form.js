Ext.define('AppAi.view.main.Form', {
    extend: 'Ext.panel.Panel',
    xtype: 'auto-form',

    title: 'Smart Form',

    layout: 'center',

    requires: [
        'Ext.ai.SmartFillField'
    ],

    bodyStyle: {
        backgroundColor: '#ccc',
    },
    items: [{
        xtype: 'form',
        width: 500,
        height: 600,
        title: 'Auto Form Example',
        border: 1,scrollable: true,
        layout: {
            type: 'vbox',
            align: 'stretch'
        },
        bodyPadding:16,
        style: {
            backgroundColor: '#fff',
        },
        defaults: {
            xtype: 'textfield',
            labelAlign: 'top',
            labelWidth: 80,
        },
        items: [{
            fieldLabel: 'First Name',
            name: 'firstName'
        }, {
            fieldLabel: 'Last Name',
            name: 'lastName'
        }, {
            fieldLabel: 'E-mail',
            name: 'email'
        }, {
            fieldLabel: 'Phone number',
            name: 'phone_number'
        }, {
            fieldLabel: 'Product',
            name: 'product_name'
        }, {
            fieldLabel: 'License',
            name: 'product_license'
        }, {
            xtype: 'textarea',
            fieldLabel: 'Full Address',
            name: 'fullAddress'
        }, {
            fieldLabel: 'Country',
            name: 'country'
        }],

        tbar: [{
            xtype: 'smart-fill-field',
            fieldLabel: 'Smart Fill',
            labelAlign: 'left',
            emptyText: 'Paste your text here',
            serverUrl: 'http://localhost:3001',
            debug: true,
            flex: 1,
            paste: false,
            llmConfig: {
                // provider: 'chatgpt',
                // model: 'gpt-4o-mini'
                provider: 'anthropic',
                model: 'claude-sonnet-4-20250514',
                rules: [
                    "product edition or license should be turned into product_license",
                    "imply the country from the given state"
                ]
            }
        }],

        bbar: ['->', {
            xtype: 'button',
            text: 'Submit'
        }]
    }]
});