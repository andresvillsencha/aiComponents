/**
 * This view is an example list of people.
 */
Ext.define('AppAiM.view.main.List', {
    extend: 'Ext.grid.Grid',
    xtype: 'mainlist',

    requires: [
        'AppAiM.store.Personnel',
        'Ext.ai.SmartSearch'
    ],

    title: 'Example',

    store: {
        type: 'personnel'
    },

    plugins: {
        // gridfilters: true
        gridfilterbar:true
    },

    items: [{
        xtype: 'toolbar',
        docked: 'top',
        items: [ 
            {
                xtype: 'ai-smartsearch',
                width: 500,
                serverUrl: 'http://localhost:3001',
                llmConfig: {
                    provider: 'anthropic',
                    model: 'claude-sonnet-4-20250514',
                },
                callback: function (view, response, prompt, fields) {
                    Ext.Msg.Alert('Worked', 'It Worked!');
                }
            }, {
                xtype: 'button',
                iconCls: 'x-fa fa-wrench',
                text: 'do it!',
                handler: function (btn) {
                    let grid = btn.up('mainlist');
                    let store = grid.store;
                    debugger;

                    store.setGrouper({
                        property: 'name',     // <-- your field
                        direction: 'ASC'
                        // groupFn: rec => rec.get('status') // optional if you need custom grouping
                    });

                    if (grid.setGrouped) {
                        grid.setGrouped(true);
                    } else {
                        grid.grouped = true; 
                    }

/*
                    store.addFilter({
                        property: 'name',
                        value: 'worf'
                    });*/
                }
            }

        ]
    }],

    columns: [{ 
        text: 'Name',
        dataIndex: 'name',
        width: 100,
        cell: {
            userCls: 'bold'
        },
        filterType: 'string'
    }, {
        text: 'Email',
        dataIndex: 'email',
        width: 230 ,
        filterType: 'string'
    }, { 
        text: 'Phone',
        dataIndex: 'phone',
        width: 150 ,
        filterType: 'string'
    }],

    listeners: {
        select: 'onItemSelected'
    }
});
