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

        'App.view.main.Form'
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
    }],

    items: [{
        title: 'Grid',
        iconCls: 'fa-table',
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
