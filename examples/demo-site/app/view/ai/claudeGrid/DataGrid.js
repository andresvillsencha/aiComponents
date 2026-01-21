/**
 * Healthcare One. Data Grid
 * This is a basic grid that contains the following elements:
 * -- Grid with different column types
 * -- A toolbar with a text field to be used as a search bar and a clear filters button
 * 
 * The grid connects to a data store where it loads the data.
 * It has a view controller that connects to a Node JS backend to perform the query.
 */
Ext.define('AppAi.view.ai.claudeGrid.DataGrid', {
  extend: 'Ext.grid.Panel',
  xtype: 'claude-grid',
  controller: 'claude-grid-controller',
  title: ' Healthcare Data Grid<br><span style="color:#eee; font-size: 12px;">Client Side Filtering + Custom Component</span>',

  requires: [
    'Ext.ai.SmartSearch',
    'AppAi.store.HealthcareDataStore',
    'AppAi.view.ai.claudeGrid.DataGridController',
    'AppAi.Globals'
  ],

  plugins: {
    gridfilters: true 
  },

  store: {
    type: 'healthcare-data-store' 
  },

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
      text: 'Employee',
      dataIndex: 'name',
      flex: 1,
      minWidth: 180,
      filter: { type: 'string' },
      summaryType: 'count',
      summaryRenderer: v => `${v} staff`
    },
    {
      text: 'Department',
      dataIndex: 'department',
      width: 140,
      filter: { 
        type: 'list',
        options: [ 'Cardiology', 'Dermatology', 'Emergency', 'ICU', 'Neurology', 'Oncology', 'Orthopedics', 'Pediatrics', 'Pharamacy', 'Radiology' ]
       }
    },
    {
      text: 'Role',
      dataIndex: 'role',
      width: 120,
      filter: { 
        type: 'list',
        options: [ 'Administrator', 'Doctor', 'Nurse', 'Technician', 'Therapist', 'Surgeon' ]

      }
    },
    {
      text: 'Shift',
      dataIndex: 'shift',
      width: 110,
      filter: { 
        type: 'list',
        options: [ 'Morning', 'Evening', 'Night' ]
      }
    },
    {
      text: 'Date',
      dataIndex: 'date',
      width: 120,
      xtype: 'datecolumn',
      format: 'Y-m-d',
      filter: { type: 'date' }
    },
    {
      text: 'Duration (hrs)',
      dataIndex: 'duration_hours',
      width: 130,
      align: 'right',
      xtype: 'numbercolumn',
      format: '0',
      filter: { type: 'number' },
      summaryType: 'sum',
      summaryRenderer: v => `${v} hrs`
    },
    {
      text: 'Status',
      dataIndex: 'status',
      width: 120,
      filter: { 
        type: 'list',
        options: [
          "Assigned",
          "On Leave",
          "Completed",
          "Pending"
        ]
      },
      renderer: (v, m) => {
        if (v === 'Assigned') m.tdStyle = 'color:#2e7d32;font-weight:600;';
        else if (v === 'Pending') m.tdStyle = 'color:#c06515;font-weight:600;';
        else if (v === 'On Leave') m.tdStyle = 'color:#8e24aa;font-weight:600;';
        else if (v === 'Completed') m.tdStyle = 'color:#1565c0;font-weight:600;';
        return v;
      },
    }

  ],

  tbar: [
    {
      xtype: 'ai-smartsearch',
      itemId: 'ai-search',
      width: 600,
      name: 'health_care_query',
      serverUrl: AppAi.Globals.apiUrl, // Will get the apiURL set in the app.js file, it can be hardcoded too i.e. 'http://ai.sencha.local:3000',
      endpoint: '/api/ai-smart-search',
      llmConfig: {
        provider: 'claude',
        model: 'claude-sonnet-4-20250514',
        rules: [
          'Searching for Users will search for employee_name'
        ]
      },
      callback: function (view, response, prompt, fields) {
        let controller=view.getController();
        controller.updateResponse(response, prompt);
      }

    }, '->', {
      xtype: 'button',
      text: 'View Response',
      iconCls: 'fa fa-comment',
      handler: 'viewResponse',
      reference: 'responseButton',
      itemId: 'responseButton',
      tooltip: 'Run a prompt to activate this button'
    }
  ],
});
