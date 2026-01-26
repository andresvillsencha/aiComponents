/**
 * This view is an example list of people.
 */
Ext.define('AppAi.view.main.List', {
    extend: 'Ext.grid.Grid',
    xtype: 'mainlist',

    requires: [
        'AppAi.store.BankingDataStore'
    ],

    title: 'Banking Grid',

    store: {
        type: 'banking-data-store' 
    },

    plugins: {
        gridfilters: true,
        pagingtoolbar: true
        // gridfilterbar:true
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

    

    columns: [
        {
            text: 'Loan ID',
            dataIndex: 'loan_id',
            width: 110,
            tooltip: 'Unique loan identifier',
            filterType: { type: 'string' }
        },
        {
            text: 'Borrower',
            dataIndex: 'borrower_name',
            flex: 1,
            minWidth: 160,
            filterType: { type: 'string' }
        },
        {
            text: 'Type',
            dataIndex: 'loan_type',
            width: 120,
            filterType: { 
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
            filterType: { type: 'number' },
        },{
            text: 'Rate',
            dataIndex: 'interest_rate',
            width: 90,
            align: 'right',
            filterType: { type: 'number' },
            renderer: v => Ext.util.Format.number(v, '0.0') + '%'
        },
        {
            text: 'Remaining',
            dataIndex: 'remaining_balance',
            width: 150,
            align: 'right',
            xtype: 'numbercolumn',
            format: '$0,0',
            filterType: { type: 'number' },
        },
        {
            text: 'Next Due',
            dataIndex: 'next_payment_due',
            width: 120,
            xtype: 'datecolumn',
            format: 'Y-m-d',
            filterType: { type: 'date' }
        },
        {
            text: 'Status',
            dataIndex: 'status',
            width: 110,
            filterType: { 
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
});
