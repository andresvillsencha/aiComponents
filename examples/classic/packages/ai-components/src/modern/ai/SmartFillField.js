/****************************************
 * Form Smart Fill
 * 
 * Text field that turns text into field data.
 * This field must be linked or inside an Ext JS form.
 * It will take the data inside of it, and put it in the matching fields.
 * 
 * 
 * 
 */
Ext.define('Ext.ai.SmartFillField', {
    extend: 'Ext.field.Text',
    xtype: 'smart-fill-field',

    config: {
        form: null,
        autorun: true,
    },

    mixins: [
        "Ext.ai.mixins.AiConn",
        "Ext.ai.mixins.SmartFillShared"
    ],

    formFields: null,
    enableKeyEvents: true,
    selectOnFocus: true,

    _init: function () {
        let me = this;

        me.formFields = me._getFormFields();

    },

    listeners: {
        beforerender: function () {
            this._init();
        },

    
        specialkey: function (obj,e) {
            let prompt=obj.getValue();
            if (e.getKey() === e.ENTER) {
                e.preventDefault();
                if (obj.getValue()!=="") obj._commit(obj.getValue());
            }
        },
        paste: function(field, e, eOpts) {
            // show me how to get the pasted text
            let be = e.browserEvent || e;
            let clipboard = be.clipboardData || window.clipboardData;

            let pastedText = '';
            if (clipboard) {
                // Standard
                if (clipboard.getData) {
                    // Some browsers prefer 'text/plain'
                    pastedText = clipboard.getData('text/plain') || clipboard.getData('Text') || '';
                }
            }

            if (pastedText!=='') {
                field._commit(pastedText);
            }
        }
    },

    

    

    
});