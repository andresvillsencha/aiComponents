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

        'AppAi.view.ai.form.AutoForm',

        'AppAi.view.ai.openAiGrid.Panel',// school grid
        'AppAi.view.ai.claudeGrid.Panel',
        'AppAi.view.ai.bankingGrid.Panel',
        
        'AppAi.Globals',
    ],

    controller: 'main',
    viewModel: 'main',

    ui: 'navigation',
    cls: 'app-nav',

    tabBarHeaderPosition: 1,
    titleRotation: 0,
    tabRotation: 0,

    header: {
        layout: {
            align: 'stretch',
        },
        title: {
            text: 'Smart Grid',
            flex: 0,
            responsiveConfig: {
                tall: {
                    hidden: true
                },
                wide: {
                    hidden: false
                }
            }
        },
        iconCls: 'fa-robot',
    },

    tabBar: {
        flex: 1,
        layout: {
            type: 'vbox',
            align: 'stretch',
            overflowHandler: 'none'
        },
        scrollable: {
            x: true,
            y: false
        },
    },

    responsiveConfig: {
        tall: {
            headerPosition: 'top',
        },
        wide: {
            headerPosition: 'left',
        }
    },


    defaults: {
        bodyPadding: 0,
        layout: 'fit',
        tabConfig: {
            responsiveConfig: {
                wide: {
                    iconAlign: 'left',
                    textAlign: 'left'
                },
                tall: {
                    iconAlign: 'top',
                    textAlign: 'center',
                    flex: 1
                }
            }
        }
    },

    items: [ {
        title: 'Autofill Form<br><span style="font-size: 12px; color:#eee;">gpt-4o-mini</span>',
        items: [{
            xtype: 'auto-form'
        }]
    }, {
        title: 'Open AI Grid<br><span style="font-size: 12px; color:#eee;">gpt-4o-mini</span>',
        items: [{
            xtype: 'openai-grid-panel'
        }]
    }, {
        title: 'Claude Grid<br><span style="font-size: 12px; color:#eee;">claude-sonnet-4.5</span>',
        items: [{
            xtype: 'claude-grid-panel'
        }]
    }, {
        title: 'Local LLM Grid<br><span style="font-size: 12px; color:#eee;">claude-3.7</span>',
        items: [{
            xtype: 'banking-grid-panel'
        }]
    },] 
});
