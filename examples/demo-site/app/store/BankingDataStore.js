/**
 * App.store.BankingDataStore
 * --------------------
 * This is a data store for user records in the application.
 * It defines the data fields and configures an Ajax proxy to load JSON data
 * from a backend endpoint (`/server/data/BankingData.json`). It also specifies how to read the 
 * data from the server response and loads the data automatically on initialization.
 */

Ext.define('AppAi.store.BankingDataStore', {
  extend: 'Ext.data.Store',
  alias: 'store.banking-data-store',

  fields: [
    { name: 'loan_id', type: 'string' },
    { name: 'borrower_name', type: 'string' },
    { name: 'loan_type', type: 'string' },
    { name: 'principal_amount', type: 'number' },
    { name: 'interest_rate', type: 'number' },
    { name: 'remaining_balance', type: 'number' },
    { name: 'next_payment_due', type: 'date' },
    { name: 'status', type: 'string' }
  ],

  remoteFilter: true,
  remoteSort: true,
  autoLoad: true,

  // Add the site's URL automatically, which is saved under the app.js file, 
  // this should not be required in your project.
  listeners: {
    beforeload: function () {
      let url=this.getProxy().getUrl();
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        // Adds the application apiURL
        // Which is saved in the app.js file
        // For example: http://www.sencha.com/
        this.getProxy().setUrl(AppAi.Globals.serverUrl+url);
      }
    }
  },

  proxy: {
    type: 'ajax',
    url: '/api/banking-data',
    reader: {
      type: 'json',
      rootProperty: 'data',
      totalProperty: 'count',
      successProperty: 'success'
    }
  },

});