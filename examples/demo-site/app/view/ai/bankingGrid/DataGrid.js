/**
 * Grid One. Data Grid
 * This is a basic grid that contains the following elements:
 * -- Grid with different column types
 * -- A toolbar with a text field to be used as a search bar and a clear filters button
 * 
 * The grid connects to a data store where it loads the data.
 * It has a view controller that connects to a Node JS backend to perform the query.
 */
Ext.define('AppAi.view.ai.bankingGrid.DataGrid', {
  extend: 'Ext.grid.Panel',
  xtype: 'banking-grid',
  controller: 'banking-grid-controller',
  title: 'Banking Data Grid<br><span style="color:#eee; font-size: 12px;">Server-Side Filtering</span>',

  requires: [
    'Ext.ai.SmartSearch',
    'AppAi.store.BankingDataStore',
    'AppAi.view.ai.bankingGrid.DataGridController'
  ],

  plugins: {
    gridfilters: true 
  },

  store: {
    type: 'banking-data-store' 
  },


  /// CHECKING FOR ISSUES HERE!!!!
  features: [{
    ftype: 'grouping',
    startCollapsed: true, 
    groupHeaderTpl: '{columnName}: {name} ({rows.length} rows)'
  }],

  bbar: {
    xtype: 'pagingtoolbar',
    displayInfo: true,
    displayMsg: 'Displaying topics {0} - {1} of {2}',
    emptyMsg: "No topics to display",
  },

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
    },
    {
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

  tbar: [{
      xtype: 'ai-smartsearch',
      itemId: 'ai-search',
      width: 600,
      name: 'banking_care_query',
      serverUrl: AppAi.Globals.apiUrl, // Will get the apiURL set in the app.js file, it can be hardcoded too i.e. 'http://ai.sencha.local:3000',
      endpoint: '/api/smart-search',
      llmConfig: {
        provider: 'localllm',
        model: 'claude-3.7-sonnet-reasoning-gemma3-12b',
        rules: [
          'Searching for Users will search for borrower_name'
        ]
      },
      callback: function (view, response, prompt, fields) {
        let controller=view.getController();
        controller.updateResponse(response, prompt);
      },
      

    }, '->', {
      xtype: 'button',
      text: 'View Response',
      iconCls: 'fa fa-comment',
      handler: 'viewResponse',
      reference: 'responseButton',
      itemId: 'responseButton',
      tooltip: 'Run a prompt to activate this button'
    }
  ]
});
