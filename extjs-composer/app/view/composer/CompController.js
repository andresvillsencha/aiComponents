
Ext.define('AppComposer.view.composer.CompController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.composer-controller',

    requires: [
        'Ext.util.ai.Conn'
    ],

    onGenerateGrid: function (btn) {
        let me=this;
        let view=this.getReferences()['view-config'];
        let form=view.getForm();
        let params = form.getValues();
        let paramsStr = JSON.stringify(params);

        if (form.isValid()) {
            view.mask('Analizing Composer data...');
            Ext.util.ai.Conn.load(paramsStr, {
                name: 'AIComposer',
                serverUrl: 'http://localhost:3001',
                llmConfig: {
                    systemPrompt: 'composer-prompt',
                },
                success: function (response) {
                    view.unmask();
                    if (response.success==true && response.classes) {
                        me._buildResponse(response.classes);
                    }
                },
                failure: function (response) {
                    Ext.toast('Couldn\'t connect to backend server');
                    view.unmask();
                }
            }, params);
        } else {
            Ext.toast('Enter all required parameters to continue');
        }

        
    },

    _buildResponse: function (views) {
        let me=this;
        let responseView=me.getReferences()['view-response'];

        if (typeof views==='object') {
            // clear tabs
                responseView.removeAll(true);
            // create new tabs
                for (let key in views) {
                    let viewData=me._syntaxHighlight(views[key]); //me._formatJsonForHtml(views[key]);
                    responseView.add({
                        xtype: 'panel',
                        title: key,
                        html: viewData,
                        scrollable: true,
                    });
                }
                responseView.setActiveTab(0);
        }
    },

    _addLayout: function (code) {
        let out = '';
        let indent = 0;
        const tab = '\t';

        let inString = false;
        let stringChar = '';
        let inLineComment = false;
        let inBlockComment = false;

        function nl() {
            out = out.replace(/[ \t]+$/,'');
            out += '\n'; // + tab.repeat(indent);
        }

        for (let i = 0; i < code.length; i++) {

            const ch   = code[i];
            const next = code[i + 1];

            // ---- comment start
            if (!inString && !inBlockComment && ch === '/' && next === '/') {
                inLineComment = true;
            }

            if (!inString && !inLineComment && ch === '/' && next === '*') {
                inBlockComment = true;
            }

            // ---- block comment end
            if (inBlockComment && ch === '*' && next === '/') {
                out += ch + next;
                i++;
                inBlockComment = false;
                continue;
            }

            // ---- line comment end
            if (inLineComment && ch === '\n') {
                inLineComment = false;
                out += '\n' + tab.repeat(indent);
                continue;
            }

            // ---- strings
            if (!inLineComment && !inBlockComment) {
                if (!inString && (ch === '"' || ch === "'" || ch === '`')) {
                    inString = true;
                    stringChar = ch;
                } else if (inString && ch === stringChar && code[i - 1] !== '\\') {
                    inString = false;
                }
            }

            if (inString || inLineComment || inBlockComment) {
                out += ch;
                continue;
            }

            // ----------------------------
            // formatting rules
            // ----------------------------

            if (ch === '{') {
                out += '{';
                indent++;
                nl();
                continue;
            }

            if (ch === '}') {
                indent = Math.max(0, indent - 1);
                nl();
                out += '}';
                continue;
            }

            if (ch === ';') {
                out += ';';
                nl();
                continue;
            }

            // very important for ExtJS configs
            if (ch === ',') {
                out += ',';
                nl();
                continue;
            }

            out += ch;
        }

        return out;
    },


    _syntaxHighlight: function(code) {
        function escapeHtml(str) {
            return str.replace(/[&<>"']/g, function(m) {
                return ({
                    '&': '&amp;',
                    '<': '&lt;',
                    '>': '&gt;',
                    '"': '&quot;',
                    "'": '&#39;'
                })[m];
            });
        }

        // Define syntax patterns (ordered by priority)
        const patterns = [
            { type: 'comment', regex: /\/\/[^\r\n]*(?:\r?\n|$)|\/\*[\s\S]*?\*\//g },
            { type: 'string',  regex: /(['"`])(?:\\.|(?!\1).)*\1/g },
            { type: 'number',  regex: /\b\d+(\.\d+)?\b/g },
            { type: 'keyword', regex: /\b(const|define|create|let|var|if|else|for|while|return|function|class|extends|new|this|true|false|null|undefined)\b/g },
            { type: 'bracket', regex: /[{}[\]()]/g },
            { type: 'ext',     regex: /\b(Ext)\b/g },
        ];

        // Assign colors per token type
        const colors = {
            comment: '#008000',   // green
            string:  '#a31515',   // dark red
            number:  '#098658',   // teal green
            keyword: '#000090',   // blue
            bracket: '#444444',   // dark gray
            ext:     '#800080',    // violet
        };

        // Tokenize safely (collect all matches)
        let tokens = [];
        patterns.forEach(function ({ type, regex })  {
            let match;
            
            while ((match = regex.exec(code)) !== null) {
                tokens.push({
                    start: match.index,
                    end: match.index + match[0].length,
                    text: match[0],
                    type
                });
            }
        });

        // Sort tokens by position and remove overlaps
        tokens.sort(function (a, b) { return a.start - b.start });
        let filtered = [];
        let lastEnd = 0;
        for (let token of tokens) {
            if (token.start >= lastEnd) {
                filtered.push(token);
                lastEnd = token.end;
            }
        }

        // Build highlighted HTML
        let result = '';
        let pos = 0;
        for (let token of filtered) {
            if (pos < token.start) {
                result += escapeHtml(code.slice(pos, token.start));
            }
            result += `<span style="color:${colors[token.type]};">${escapeHtml(token.text)}</span>`;
            pos = token.end;
        }
        if (pos < code.length) result += escapeHtml(code.slice(pos));

        // 7️Return formatted block with monospace styling
        return result;
    },

});
