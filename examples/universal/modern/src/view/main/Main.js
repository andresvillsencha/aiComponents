/**
 * This class is the main view for the application. It is specified in app.js as the
 * "mainView" property. That setting causes an instance of this class to be created and
 * added to the Viewport container.
 */
Ext.define('AppAi.view.main.Main', {
    extend: 'Ext.Panel',
    xtype: 'app-main',

    requires: [
        'Ext.MessageBox',
        'Ext.layout.Fit',

        'AppAi.view.main.List',
        'AppAi.view.main.Form',

        'Ext.util.ai.Conn'
    ],

    controller: 'main',
    viewModel: 'main',

    layout: 'fit',

    tbar: [{ 
        xtype: 'button',
        iconCls: 'x-fa fa-tablet',
        text: 'Modern -> Classic',
        handler: function (btn) {
            let url = new URL(window.location.href);
            let toolkit = url.searchParams.get('toolkit');
            url.searchParams.set(
                'toolkit',
                toolkit === 'modern' ? 'classic' : 'modern'
            );

            window.location.href = url.toString();
        }
    }, {
        xtype: 'button',
        iconCls: 'x-fa fa-robot',
        text: 'Tell me a Joke',
        handler: function (btn) {
            let jokeType = ["knock knock", "bar", "it", "scary", "animal", "software"]
            btn.setIconCls('x-fa fa-spinner fa-spin');
            btn.setDisabled(true);
            Ext.util.ai.Conn.load(" Tell me "+jokeType[Math.floor(Math.random()*jokeType.length)]+" joke number: ", {
                serverUrl: 'http://localhost:3001',
                llmConfig: {
                    provider: 'anthropic',
                    systemPrompt: 'generic-prompt',
                },
                success: function (response) {
                    btn.setIconCls('x-fa fa-robot');
                    btn.setDisabled(false);
                    Ext.Msg.alert("Response:", response.response);
                },
                failure: function (response) {
                    btn.setIconCls('x-fa fa-robot');
                    btn.setDisabled(false);
                    console.error('Could not get a valid response from middleware');
                },
            });
        }
    }],

    items: [{
        xtype: 'tabpanel',

        tabBarPosition: 'bottom',
        defaults: {
            tab: {
                iconAlign: 'top'
            },
            layout: 'fit'
        },
        items: [
            // TODO - Replace the content of this view to suit the needs of your application.
            {
                title: 'Grid',
                iconCls: 'x-fa fa-table',
                layout: 'fit',
                // The following grid shares a store with the classic version's grid as well!
                items: [{
                    xtype: 'mainlist'
                }]
            },{
                title: 'Form',
                iconCls: 'x-fa fa-pen-square',
                layout: 'fit',
                // The following grid shares a store with the classic version's grid as well!
                items: [{
                    xtype: 'auto-form'
                }]
            },
        ]
    }],

    
});
