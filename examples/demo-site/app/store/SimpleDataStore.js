/**
 * App.store.SimpleDataStore
 * --------------------
 * This is a data store for user records in the application.
 * It defines the data fields and configures an Ajax proxy to load JSON data
 * from a backend endpoint (`/server/data/SimpleData.json`). It also specifies how to read the 
 * data from the server response and loads the data automatically on initialization.
 */

Ext.define('AppAi.store.SimpleDataStore', {
  extend: 'Ext.data.Store',
  alias: 'store.simple-data-store',

  fields: [
    { name: 'name', type: 'string' },
    { name: 'age', type: 'int' },
    { name: 'email', type: 'string' },
    { name: 'status', type: 'string' },
    { name: 'country', type: 'string' },
    { name: 'last_month_sales', type: 'number' },
    { name: 'created_at', type: 'date' }
  ],

  remoteFilter: false,
  autoLoad: true,

  proxy: {
    type: 'ajax',
    url: '/server/data/SimpleData.json',
    reader: {
      type: 'json',
      rootProperty: 'data',
      totalProperty: 'count',
      successProperty: 'success'
    }
  },

});