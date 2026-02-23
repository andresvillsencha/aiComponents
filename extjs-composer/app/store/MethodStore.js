Ext.define('AppComposer.store.MethodStore', {
    extend: 'Ext.data.Store',
    alias: 'store.methodstore',

    fields: [
        { name: 'value', type: 'string' },
        { name: 'text',  type: 'string' }
    ],

    data: [
        { value: 'GET',    text: 'GET' },
        { value: 'POST',   text: 'POST' },
        { value: 'PUT',    text: 'PUT' },
        { value: 'DELETE', text: 'DELETE' }
    ]
});