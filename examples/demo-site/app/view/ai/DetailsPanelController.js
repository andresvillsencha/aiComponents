Ext.define('AppAi.view.ai.DetailsPanelController', {
  
    extend: 'Ext.app.ViewController',
    alias: 'controller.details-controller',

    loadTabs: function () {
        let view=this.getView();
        let me=this;

        view.items.each(function (viewTab) {
            if (viewTab.autoFill!==false) {
                if (viewTab.items.length===0) {
                    me.loadTab(viewTab,viewTab.contentType);
                } else {
                    viewTab.items.each(function (innerViewTab) {
                        me.loadTab(innerViewTab,innerViewTab.contentType);
                    });
                }
            }
        });
    },

    loadTab: function (tab,contentType=null) {
        let me=this;
        if (tab.className!==undefined) {
            contentType = (contentType) ? contentType.toLowerCase() : 'extjs' ;
            me._openFile(tab.className, contentType, function (success, response) {
                if (success && response.responseText!==undefined && response.responseText!==null) {
                    if (contentType!=='readhtml') {
                        tab.setHtml(me.formatText(response.responseText));
                    } else {
                        tab.setHtml(response.responseText);
                    }
                } else {
                    tab.setHtml(`Tab panel not found: <strong style='color:#900;'>${tab.className}</strong>`);
                }
            });
        }
    },

    /**
     * Opens File to load its contents into a panel
     * @param {*} fileName 
     * @param {*} callback 
     */
    _openFile: function (fileName, contentType, callback) {
        let fullFileName = fileName.replace(/\./g, '/');
        let fileTypes = {
            'extjs': 'js',
            'nodejs': 'js',
            'js': 'js',
            'json': 'json',
            'html': 'html',
            "readhtml": "html"
        };

        fullFileName = fullFileName + '.' + fileTypes[contentType];


        Ext.Ajax.request({
            url: fullFileName,
            success: function (response) {
                if (callback) callback(true, response);
            },
            failure: function () {
                console.log('Could not load file: %c' + fileName,'color:#900;');
                if (callback) callback(false, null);
            }
        });
    },

    
    /**
     * Formats text
     * If RegExp is not available, just adds line breaks and pre style
     * @param {*} text 
     * @returns 
     */
    formatText: function (text) {
        let me=this;
        let result=text;

        if (RegExp.prototype.exec!==undefined) { 
            // If it is possible to exec regular expressions, add style 
            result=me._syntaxHighlight(result);
        } else {
            // Just put it as plain text
            result = result.replace('\n','<br>');
            console.log('RegEx not available, applying simple formatting');
        }
        return `<pre style="border-radius:6px;overflow:auto;font-family:Consolas,monospace;font-size:13px; white-space: pre;">${result}</pre>`;
    },

    /**
     * Formats String to make it look like code
     * @param {*} code 
     * @returns 
     */
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

        // Return formatted block with monospace styling
        return result;
    }
});