Ext.define('AppAi.view.ai.ResponseWindow', {
    extend: 'Ext.window.Window',
    xtype: 'response-window',

    config: {
        aiPrompt: 'NOT SET',
        aiTokens: 0,
        aiResponse: 'NOT SET'
    },
    
    title: 'Response from server',
    width: 600, 
    maxWidth: window.innerWidth - 50,
    height: 400,
    modal: true,
    layout: { 
        type: 'vbox',
        align: 'stretch',
    },

    items: [{
        xtype: 'panel',
        bodyPadding: 8,
        bodyStyle: {
          backgroundColor: '#eee'
        },
        html: 'NOT SET'
    },{
        xtype: 'panel',
        bodyPadding: 8,
        bodyStyle: {
          backgroundColor: '#ddd'
        },
        html: '-'
    }, {
        xtype: 'panel',
        flex: 1,
        scrollable: true,
        bodyPadding: 16,
        html: 'NOT SET',
        bodyStyle: {
            fontFamily: 'monospace',
            fontSize: '13px',
            backgroundColor: "#fff", 
            color: '#444',
        },
    }],
    buttons: ['->',{
        text: 'Close',
        handler: function () {
          this.up('response-window').close();
        }
    }],

    formatJsonForHtml: function(jsonString,colorize=false) {
        const style=`
            <style>
                .json .string { color: #0B7500; }
                .json .number { color: #1C00CF; }
                .json .boolean { color: #AA0D91; }
                .json .null { color: gray; }
                .json .key { color: #A31515; }
            </style>
        `;
        if (colorize) {
            try {
                const pretty = JSON.stringify(jsonString, null, 4)
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/("(\\u[\da-fA-F]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|\b\d+(\.\d+)?\b)/g, match => {
                        let cls = 'number';
                        if (/^"/.test(match)) {
                            cls = /:$/.test(match) ? 'key' : 'string';
                        } else if (/true|false/.test(match)) {
                            cls = 'boolean';
                        } else if (/null/.test(match)) {
                            cls = 'null';
                        }
                        return `<span class="${cls}">${match}</span>`;
                    });

                return `${style}<pre class="json">${pretty}</pre>`;
            } catch (e) {
                return `${style}<pre class="json error">${Ext.htmlEncode(jsonString)}</pre>`;
            }
        } else {
            return style+'<pre>'+JSON.stringify(jsonString, null, 4)+'</pre>';
        }
        
    },


    initComponent: function () {
        let me=this;

        // Set Values
            me.items[0].html = '<strong>Prompt: </strong>'+ (me.config.aiPrompt || "NOT SET"),
            me.items[1].html = '<strong>Tokens consumed: </strong>'+ (me.config.aiTokens || "-"),
            me.items[2].html = me.formatJsonForHtml(me.config.aiResponse || "NOT SET",true),

        this.callParent();
    }
});