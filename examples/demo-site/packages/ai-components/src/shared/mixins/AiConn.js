/**
 * Ext.ai.mixins.AiConn
 *
 * Mixin that provides a reusable method to connect Ext JS components to the
 * AI Middleware (Node.js backend). It standardizes how components send prompts
 * and receive responses from an LLM-powered service.
 *
 * This mixin acts as a lightweight communication layer between the Ext JS
 * frontend and the middleware responsible for interacting with AI providers
 * such as OpenAI or Anthropic.
 *
 * Responsibilities
 * - Sends prompt data to the middleware using an Ajax POST request
 * - Normalizes request payload structure
 * - Handles JSON decoding of responses
 * - Provides standardized success and failure callbacks
 * - Optionally logs debug information and shows UI error notifications
 *
 * The mixin is intended to be included in components that need to perform
 * AI-powered operations such as:
 * - Natural language query parsing
 * - Dynamic filter generation
 * - AI-assisted UI configuration
 * - Data transformation using LLMs
 *
 * Expected Middleware Contract
 * The middleware should accept POST requests with the following payload:
 *
 * {
 *     query: <promptObject>,
 *     llmConfig: <optional configuration>
 * }
 *
 * The middleware response is expected to be JSON with a structure similar to:
 *
 * {
 *     success: true,
 *     data: {...}
 * }
 *
 * or in case of error:
 *
 * {
 *     success: false,
 *     error: "Error description"
 * }
 *
 * Configuration
 * The mixin exposes a configurable `llmConfig` object that allows components
 * to define LLM behavior such as provider, model, temperature, prompt rules,
 * and examples.
 *
 * Typical Usage
 *
 * Ext.define('MyApp.view.SomeComponent', {
 *     extend: 'Ext.panel.Panel',
 *     mixins: ['Ext.ai.mixins.AiConn'],
 *
 *     someMethod: function () {
 *         this._connectToMiddleWare({
 *             serverUrl: '/api/ai',
 *             promptObj: { userPrompt: 'Find all active users' },
 *             success: function(result) {
 *                 console.log(result);
 *             }
 *         });
 *     }
 * });
 *
 * @mixin
 */


Ext.define('Ext.ai.mixins.AiConn', {
    /**
     * @cfg {Object} llmConfig
     * Default LLM configuration sent/used by the middleware (if you choose to include it in the payload).
     * Keep this small; rules/examples ideally live server-side to avoid prompt bloat on the client.
     */

    config: {
        llmConfig: {
            provider: 'chatgpt',
            model: 'gpt-4o-mini',
            temperature: 0,
            systemPrompt: {
                name: null, // name of the system prompt, if null, it will read the default system prompt, and ignore the build property
            },
            rules: [],  // New rules can be added to the prompt, best practice would be to add it to the system prompt in the backend directly
            examples: [],
        },

        /**
         * @cfg {Boolean} debug
         * When true, logs extra info to console.
         */
        debug: false,

        /**
         * @cfg {Boolean} showError
         * When true, shows a toast on connection errors.
         */
        showError: true,

        /**
         * @cfg {Number} timeout
         * Ajax timeout (ms). 60 seconds; set explicitly for predictable behavior.
         */
        timeout: 60000
    },


    /**
     * Connects to the AI middleware and posts a query payload.
     *
     * Expected connectionObj:
     * - promptObj {Object} Data object with params to be sent (required)
     * - serverUrl {String} Middleware endpoint URL (required)
     * - success {Function} Success callback (required)
     * - failure {Function} Failure callback (optional)
     *
     * Optional:
     * - timeout {Number} override request timeout (ms)
     * - headers {Object} extra request headers
     *
     * Callback signatures:
     * - success(result, response)
     * - failure(error, response)
     *
     * @param {Object} connectionObj
     * @return {Ext.data.request.Ajax} The Ajax request object (can be aborted by caller).
     * @private
     */
    _connectToMiddleWare: function (connectionObj) {
        let me=this;

        // Basic shape validation
            if (!connectionObj || !Ext.isObject(connectionObj)) {
                me._logError('AiConn._connectToMiddleWare: connectionObj must be an object.', connectionObj);
                return null;
            }

        let promptObj = connectionObj.promptObj,
            serverUrl = connectionObj.serverUrl,
            onSuccess = connectionObj.success,
            onFailure = connectionObj.failure;

        // Validate required fields.
            if (!promptObj || !Ext.isObject(promptObj)) {
                me._logError('AiConn._connectToMiddleWare: Missing/invalid "promptObj" (must be an object).', connectionObj);
                return null;
            }

            if (!serverUrl || !Ext.isString(serverUrl)) {
                me._logError('AiConn._connectToMiddleWare: Missing/invalid "serverUrl" (must be a string).', connectionObj);
                return null;
            }

            if (onSuccess!==null && onSuccess!==undefined && !Ext.isFunction(onSuccess)) {
                me._logError('AiConn._connectToMiddleWare: Missing/invalid "success" callback (must be a function).', connectionObj);
                return null;
            }

        // Prepare Payload
            let payload = {
                query: promptObj
            };


        // Perform Ajax Request
            return Ext.Ajax.request({
                    url: serverUrl,
                    method: 'POST',
                    jsonData: payload,

                    timeout: Ext.isNumber(connectionObj.timeout) ? connectionObj.timeout : me.getTimeout(),
                    headers: connectionObj.headers || undefined,

                    success: function (response) {
                        // Decode JSON safely. If the server returns non-JSON, don't crash the app.
                            let result = me._safeDecode(response && response.responseText);

                        // If decode failed, still call success with a structured error so the caller can react.
                            if (result === null) {
                                result = {
                                    success: false,
                                    error: 'Invalid JSON response from middleware.'
                                };
                            }

                        // Caller owns business logic; normalize transport.
                            try {
                                onSuccess(result, response);
                            } catch (e) {
                                me._logError('AiConn success callback threw an exception.', e);
                                if (me.getShowError()) Ext.toast('Connection successfull: But response could not be');
                            }
                    },
                    failure: function (response) {
                        let parsed = me._safeDecode(response && response.responseText),
                            errorObj = parsed || {
                                success: false,
                                error: 'Request failed or middleware unreachable.'
                            };

                        me._logError('AiConn middleware request failed.', {
                            status: response && response.status,
                            statusText: response && response.statusText,
                            responseText: response && response.responseText
                        });

                        if (me.getShowError()) Ext.toast('Connection error: Could not connect to Middleware');
                        
                        if (Ext.isFunction(onFailure)) {
                            try {
                                onFailure(response, errorObj);
                            } catch (e) {
                                me._logError('AiConn failure callback threw an exception.', e);
                            }
                        }
                    }
                });
    },


    /**
     * Safe JSON decode helper.
     * Returns decoded object on success, or null on failure.
     *
     * @param {String} text
     * @return {Object|null}
     * @private
     */
    _safeDecode: function (text) {
        if (!text || !Ext.isString(text)) {
            return null;
        }

        try {
            return Ext.decode(text);
        } catch (e) {
            this._logError('AiConn: Failed to decode JSON response.', e);
            return null;
        }
    },

    /**
     * Debug/error logger that respects the mixin config.
     *
     * @param {String} msg
     * @param {*} data
     * @private
     */
    _logError: function (msg, data) {
        if (this.getDebug() && console && console.error) {
            console.error(msg, data);
        }
    }
    
});