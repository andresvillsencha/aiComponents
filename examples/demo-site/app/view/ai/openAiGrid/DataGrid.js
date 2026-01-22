/**
 * School . Data Grid
 * This is a basic grid that contains the following elements:
 * -- Grid with fake school data in different column types
 * -- A toolbar with the Smart Search Field
 * 
 */
Ext.define('AppAi.view.ai.openAiGrid.DataGrid', {
  extend: 'Ext.grid.Panel',
  xtype: 'openai-grid',
  controller: 'school-grid-controller',
  title: 'Smart Search<br><span style="color:#eee; font-size: 12px;">Open AI: gpt-4o-mini</span>',

  requires: [
    'Ext.ai.SmartSearch',
    'AppAi.store.SchoolDataStore',
    'AppAi.view.ai.schoolGrid.DataGridController',
    'AppAi.Globals'
  ],

  plugins: {
    gridfilters: true 
  },

  store: {
    type: 'school-data-store' 
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
      text: 'Student ID',
      dataIndex: 'student_id',
      width: 120,
      filter: { type: 'string' }
    },
    {
      text: 'Full Name',
      dataIndex: 'full_name',
      flex: 1,
      minWidth: 180,
      filter: { type: 'string' },
      summaryType: 'count',
      summaryRenderer: v => `${v} students`
    },
    {
      text: 'Grade',
      dataIndex: 'grade',
      width: 100,
      align: 'center',
      filter: { 
        type: 'number'
       },
    },
    {
      text: 'Avg. Score',
      dataIndex: 'avg_score',
      width: 120,
      align: 'right',
      xtype: 'numbercolumn',
      format: '0',
      filter: { type: 'number' },
      renderer: function (value,meta,row) {
        if (value<60) {
          meta.tdStyle = 'color:#b71c1c; font-weight:600;';
        }
        return value;
      }
    },
    {
      text: 'Letter',
      dataIndex: 'letter_grade',
      width: 100,
      align: 'center',
      filter: { 
        type: 'list',
        options: [ 'A', 'B', 'C', 'D', 'E', 'F' ]
      }, 
      renderer: function (value,meta,row) {
        if (value==='F') {
          meta.tdStyle = 'color:#b71c1c; font-weight:600;';
        }
        return value;
      }
    },
    {
      text: 'Age',
      dataIndex: 'age',
      width: 90,
      align: 'right',
      xtype: 'numbercolumn',
      format: '0',
      filter: { type: 'number' },
    },
    {
      text: 'Gender',
      dataIndex: 'gender',
      width: 110,
      filter: { 
        type: 'list',
        options: [ 'Female', 'Male' ]
      }
    },
    {
      text: 'Enrollment Date',
      dataIndex: 'enrollment_date',
      width: 140,
      xtype: 'datecolumn',
      format: 'Y-m-d',
      filter: { type: 'date' }
    },
    {
      text: 'Status',
      dataIndex: 'status',
      width: 120,
      filter: { 
        type: 'list',
        options: [ 'Active', 'Transferred', 'Inactive', 'Graduated' ]
      },
      renderer: (v, m) => {
        if (v === 'Active')     m.tdStyle = 'color:#2e7d32;font-weight:600;';
        if (v === 'Graduated')  m.tdStyle = 'color:#1565c0;font-weight:600;';
        if (v === 'Transfered')  m.tdStyle = 'color:#8e24aa;font-weight:600;';
        if (v === 'Inactive')  m.tdStyle = 'color:#aa2424;font-weight:600;';
        return v;
      },
    },
    {
      text: 'Guardian',
      dataIndex: 'guardian_name',
      width: 180,
      filter: { type: 'string' }
    },
    {
      text: 'Guardian Contact',
      dataIndex: 'guardian_contact',
      width: 150,
      filter: { type: 'string' }
    }
  ],

  tbar: [
    {
      xtype: 'ai-smartsearch',
      itemId: 'ai-search',
      name: 'school_care_query',
      serverUrl: AppAi.Globals.apiUrl, // Getting the apiURL from globals, it can be hardcoded too i.e. 'http://ai.sencha.local:3000',
      endpoint: '/api/ai-smart-search',
      width: 400,
      debug: true,
      llmConfig: {
        provider: 'chatgpt',
        model: 'gpt-4o-mini',
        rules: [
          'Searching for Users will search for full_name',
          'Searching for parents will search for guardian_name'
        ]
      },
      callback: function (view, response, prompt, fields) {
        let controller=view.getController();
        controller.updateResponse(response, prompt);
      },
      actions: {
        search: true,
        reset: true
      }

    },'->',{
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
