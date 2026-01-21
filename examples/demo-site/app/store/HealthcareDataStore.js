/**
 * App.store.HealthcareDataStore
 * --------------------
 * This is a data store for user records in the application.
 * It defines the data fields and configures an Ajax proxy to load JSON data
 * from a backend endpoint (`/server/data/HealthcareData.json`). It also specifies how to read the 
 * data from the server response and loads the data automatically on initialization.
 */

Ext.define('AppAi.store.HealthcareDataStore', {
  extend: 'Ext.data.Store',
  alias: 'store.healthcare-data-store',

  fields: [
    { name: 'employee_id', type: 'string' },
    { name: 'name', type: 'string' },
    { name: 'department', type: 'string' },
    { name: 'role', type: 'string' },
    { name: 'shift', type: 'string' },
    { name: 'date', type: 'date' },
    { name: 'duration_hours', type: 'int' },
    { name: 'status', type: 'string' }
  ],

  remoteFilter: true,
  remoteSort: true,
  autoLoad: true,
  remoteGroup: false,

  // Add the site's URL automatically, which is saved under the app.js file, 
  // this should not be required in your project.
  listeners: {
    beforeload: function () {
      let url=this.getProxy().getUrl();
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        this.getProxy().setUrl(AppAi.Globals.serverUrl+url);
      }
    }
  },


  proxy: {
    type: 'ajax',
    url: '/api/healthcare-data',
    reader: {
      type: 'json',
      rootProperty: 'data',
      totalProperty: 'count',
      successProperty: 'success'
    }
  },

});