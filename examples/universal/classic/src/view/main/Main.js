/**
 * This class is the main view for the application. It is specified in app.js as the
 * "mainView" property. That setting automatically applies the "viewport"
 * plugin causing this view to become the body element (i.e., the viewport).
 *
 * TODO - Replace this content of this view to suite the needs of your application.
 */
Ext.define('AppAi.view.main.Main', {
    extend: 'Ext.tab.Panel',
    xtype: 'app-main',

    requires: [
        'Ext.plugin.Viewport',
        'Ext.window.MessageBox',

        'AppAi.view.main.MainController',
        'AppAi.view.main.MainModel',
        'AppAi.view.main.List',

        'AppAi.view.main.Form',

        'Ext.util.ai.Conn'
    ],

    controller: 'main',
    viewModel: 'main',

    ui: 'navigation',

    tabBarHeaderPosition: 1,
    titleRotation: 0,
    tabRotation: 0,

    header: {
        layout: {
            align: 'stretchmax'
        },
        title: {
            bind: {
                text: '{name}'
            },
            flex: 0
        },
        iconCls: 'fa-th-list'
    },

    tabBar: {
        flex: 1,
        layout: {
            align: 'stretch',
            overflowHandler: 'none'
        }
    },

    responsiveConfig: {
        tall: {
            headerPosition: 'top'
        },
        wide: {
            headerPosition: 'left'
        }
    },

    defaults: {
        bodyPadding: 0,
        tabConfig: {
            responsiveConfig: {
                wide: {
                    iconAlign: 'left',
                    textAlign: 'left'
                },
                tall: {
                    iconAlign: 'top',
                    textAlign: 'center',
                    width: 120
                }
            }
        }
    },

    tbar: [{
        xtype: 'button',
        iconCls: 'fa fa-laptop-code',
        text: 'Classic -> Modern',
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
        iconCls: 'fa fa-robot',
        text: 'Tell me a Joke',
        handler: function (btn) {
            let jokeType = ["knock knock", "bar", "it", "scary", "animal", "software"]
            btn.setIconCls('fa fa-spinner fa-spin');
            btn.setDisabled(true);
            Ext.util.ai.Conn.load(" Tell me "+jokeType[Math.floor(Math.random()*jokeType.length)]+" joke number: ", {
                serverUrl: 'http://localhost:3001',
                llmConfig: {
                    provider: 'anthropic',
                    systemPrompt: 'generic-prompt',
                },
                success: function (response) {
                    btn.setIconCls('fa fa-robot');
                    btn.setDisabled(false);
                    Ext.Msg.alert("Response:", response.response);
                },
                failure: function (response) {
                    btn.setIconCls('fa fa-robot');
                    btn.setDisabled(false);
                    console.error('Could not get a valid response from middleware');
                },
            });
        }
    }],

    items: [{
        title: 'Grid',
        iconCls: 'fa-table',
        layout: 'fit',
        // The following grid shares a store with the classic version's grid as well!
        items: [{
            xtype: 'mainlist'
        }]
    }, {
        title: 'Form',
        iconCls: 'fa-pen-square',
        layout: 'fit',
        // The following grid shares a store with the classic version's grid as well!
        items: [{
            xtype: 'auto-form'
        }]
    }]
});
