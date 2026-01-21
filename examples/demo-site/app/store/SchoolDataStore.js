/**
 * App.store.SchoolDataStore
 * --------------------
 * This is a data store for user records in the application.
 * It defines the data fields and configures an Ajax proxy to load JSON data
 * from a backend endpoint (`/server/data/SchoolData.json`). It also specifies how to read the 
 * data from the server response and loads the data automatically on initialization.
 * }
 */

Ext.define('AppAi.store.SchoolDataStore', {
  extend: 'Ext.data.Store',
  alias: 'store.school-data-store',

  fields: [
    { name: 'student_id', type: 'string' },
    { name: 'full_name', type: 'string' },
    { name: 'grade', type: 'string' },
    { name: 'age', type: 'int' },
    { name: 'gender', type: 'string' },
    { name: 'enrollment_date', type: 'date' },
    { name: 'status', type: 'string' },
    { name: 'guardian_name', type: 'string' },
    { name: 'guardian_contact', type: 'string' },
    { name: 'avg_score', type: 'number' },
    { name: 'letter_grade', type: 'string' }
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
    url: '/api/school-data',
    reader: {
      type: 'json',
      rootProperty: 'data',
      totalProperty: 'count',
      successProperty: 'success'
    }
  },

});