/**
 * App.store.BankingDataStore
 * --------------------
 * This is a data store for user records in the application.
 * It defines the data fields and configures an Ajax proxy to load JSON data
 * from a backend endpoint (`/server/data/BankingData.json`). It also specifies how to read the 
 * data from the server response and loads the data automatically on initialization.
 */

Ext.define('AppAiC.store.BankingDataStore', {
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

  proxy: {
    type: 'ajax',
    url: 'http://localhost:3005/api/banking-data',
    reader: {
      type: 'json',
      rootProperty: 'data',
      totalProperty: 'count',
      successProperty: 'success'
    }
  },

});