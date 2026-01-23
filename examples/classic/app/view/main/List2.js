/**
 * This view is an example list of people.
 */
Ext.define('AppAiC.view.main.List2', {
    extend: 'Ext.grid.Panel',
    xtype: 'mainlist2',

    requires: [
        'AppAiC.store.BankingDataStore'
    ],

    title: 'Banking Grid',

    store: {
        type: 'banking-data-store' 
    },

    plugins: {
        // gridfilters: true
        gridfilterbar:true
    },



    features: [{
        ftype: 'grouping',
        startCollapsed: true, 
        groupHeaderTpl: '{columnName}: {name} ({rows.length} rows)'
    }],

    tbar: [ 
        {
            xtype: 'ai-smartsearch',
            width: 500,
            serverUrl: 'http://localhost:3001',
            llmConfig: {
                provider: 'anthropic',
                model: 'claude-sonnet-4-20250514',
            }
        }, 
        {
            xtype: 'button',
            iconCls: 'x-fa fa-plus',
            handler: function (btn) {
                let grid=btn.up('mainlist2');
                let store = grid.store;

                store.addFilter({
                    property: 'interest_rate',
                    type: 'list', // fix filter type change from LLM
                    operator: '>',
                    value: 7,
                    options: [] // will fix an issue with options on a list filter
                });
            }
        }

    ],


    columns: [
        {
            text: 'Loan ID',
            dataIndex: 'loan_id',
            width: 110,
            tooltip: 'Unique loan identifier',
            filter: { type: 'string' }
        },
        {
            text: 'Borrower',
            dataIndex: 'borrower_name',
            flex: 1,
            minWidth: 160,
            filter: { type: 'string' }
        },
        {
            text: 'Type',
            dataIndex: 'loan_type',
            width: 120,
            filter: { 
                type: 'list' ,
                options: [
                    'Personal',
                    'Auto',
                    'Mortgage',
                    'Business',
                    'Education'
                ]
            } 
        },
        {
            text: 'Principal',
            dataIndex: 'principal_amount',
            width: 140,
            align: 'right',
            xtype: 'numbercolumn',
            format: '$0,0',
            filter: { type: 'number' },
        },{
            text: 'Rate',
            dataIndex: 'interest_rate',
            width: 90,
            align: 'right',
            filter: { type: 'number' },
            renderer: v => Ext.util.Format.number(v, '0.0') + '%'
        },
        {
            text: 'Remaining',
            dataIndex: 'remaining_balance',
            width: 150,
            align: 'right',
            xtype: 'numbercolumn',
            format: '$0,0',
            filter: { type: 'number' },
        },
        {
            text: 'Next Due',
            dataIndex: 'next_payment_due',
            width: 120,
            xtype: 'datecolumn',
            format: 'Y-m-d',
            filter: { type: 'date' }
        },
        {
            text: 'Status',
            dataIndex: 'status',
            width: 110,
            filter: { 
                type: 'list',
                options: [
                    'Current',
                    'Paid Off',
                    'Overdue',
                ]
            },
            renderer: (v, m) => {
                // Optional styling hook
                if (v === 'Overdue') m.tdStyle = 'color:#c62828;font-weight:600;';
                else if (v === 'Current') m.tdStyle = 'color:#2e7d32;font-weight:600;';
                else if (v === 'Paid Off') m.tdStyle = 'color:#607dcb; font-weight: 600;';
                return v;
            }
        }
    ],
    

    listeners: {
        select: 'onItemSelected'
    }
});
