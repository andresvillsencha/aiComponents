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
    extend: 'Ext.field.Container',
    xtype: 'smart-fill-field',

    config: {
        form: null,
    },

    layout: 'hbox',

    mixins: [
        "Ext.ai.mixins.AiConn",
        "Ext.ai.mixins.SmartFillShared"
    ],

    formFields: null,

    _init: function () {
        let me = this;


        let field=me._getItem('ai-textfield')
        let button=me._getItem('ai-button');

        let placeholderText = (typeof me.placeholder === 'string') ? me.placeholder : ((typeof me.emptyText==='string') ? me.emptyText : '');

        field.setPlaceholder(placeholderText);
        
        if (me.config.button) {
            button.setHidden(me.config.button.hidden);
            button.setText(me.config.button.text);
            button.setIconCls(me.config.button.iconCls);
        } else {
            button.setHidden(true);
        }

        me.formFields = me._getFormFields();
    },

    items: [{
        xtype: 'textfield',
        itemId: 'ai-textfield',
        flex: 1,
        ignoreField: true,
        enableKeyEvents: true,
        selectOnFocus: true,
        listeners: {
            specialkey: function (obj,e) {
                let container = obj.up('smart-fill-field');
                let prompt=obj.getValue();
                if (e.getKey() === e.ENTER) {
                    e.preventDefault();
                    if (prompt!=="") container._commit(prompt);
                }
            },
            paste: function(field, e, eOpts) {
                // show me how to get the pasted text
                let be = e.browserEvent || e;
                let clipboard = be.clipboardData || window.clipboardData;
                let container = field.up('smart-fill-field');

                if (container.config.paste===true) {
                    let pastedText = '';
                    if (clipboard) {
                        if (clipboard.getData) {
                            pastedText = clipboard.getData('text/plain') || clipboard.getData('Text') || '';
                        }
                    }

                    if (pastedText!=='') {
                        container._commit(pastedText);
                    }
                }
            }
        }
    }, {
        xtype: 'button',
        itemId: 'ai-button',
        iconCls: 'x-fa fa-play',
        text: '',
        handler: function (btn) {
            let container = btn.up('smart-fill-field');
            let obj = container._getItem('ai-textfield');
            let prompt = obj.getValue();
            if (prompt!=="") container._commit(prompt);
        }
    }],

    listeners: {
        painted: function () {
            this._init();
        },

    },

    

    

    
});