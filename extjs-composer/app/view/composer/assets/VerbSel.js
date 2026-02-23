Ext.define('AppComposer.view.composer.assets.VerbSel', {
    extend: 'Ext.form.field.ComboBox',
    xtype: 'verbsel',

    requires: [
        'AppComposer.store.MethodStore'
    ],


    queryMode: 'local',
    editable: false,
    forceSelection: true,

    displayField: 'text',
    valueField: 'value',

    store: {
        type: 'methodstore'
    },

});