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
