# Ai Sencha Components

## 1. Introduction
This project contains the totality of the Ext JS AI components files.
The files in this project are grouped in the following folders:
 - ai-component
   The Ext JS Package to be used in ExtJS projects. It is toolkit agnostic, 
   can be used in both, modern and classic toolkit projects. 
 - ai-server
   The middle-ware NodeJS project. This is required to connect the ai-component to
   an AI provider/model.
 - examples
    - data-server
      Used by the classic and modern grid examples. It is a Node JS express server
      that contains a json "database" and receives frontend queries to retreive the data.
    - classic
      A simple Ext JS Classic App with two views. It contains one grid with the AI Smart Search component and a form with the AI Smart Fill component. 
    - modern
      A simple Ext JS Modern App with two views. It contains one grid with the AI Smart Search component and a form with the AI Smart Fill component. 


## 2. Getting started using the AI components in your own project
Inside the ai-component folder is the Ext JS Ai-component to be used as a package.
Steps to install:
   ### 2.1. FRONT END
      - Download the ai-component folder (unzip if necessary) and place it in the packages folder inside your project.
      - Open the app.json file from your project and add the 'ai-components' package.
      - refresh and rebuild your project to make sure the new components are added:
         - sencha app refresh
         - sencha app build [development|testing|production]
      - Add the component just like a basic textfield component inside your project. Example:
         {
            xtype: 'ai-smartsearch',
            itemId: 'ai-search',
            width: 600,
            name: 'health_care_query',
            serverUrl: 'http://ai.sencha.local:3000',                // This should be specified
            endpoint: '/api/ai-smart-search',                        // this is the default endpoint, if the provided middleware is used, this property can be ignored
            systemPrompt: 'system-prompt',                           // The json file in the middleware that contains the generic system prompt. 
                                                                     // It is optional, if not specified, system-prompt will be used
            llmConfig: {
            provider: 'anthropic',                                 // The AI Provider, can be openai or anthropic
            model: 'claude-sonnet-4-20250514',                     // The model
            rules: [                                               // OPTIONAL: allows to add extra rules to the system prompt
               'Searching for Users will search for employee_name'
            ],
            examples: [                                            // OPTIONAL: allows to add extra examples to the system prompt
               
            ]
            },
            callback: function (view, response, prompt, fields) {
            // TODO: add your code if you need to use the middleware response for something else
            }
         }
   #### 2.1.1 IMPORTANT
         It is required to have the gridfilters or gridfilterbar plugin active for the filters to work.
         It is also required to specify a type or filterType on every column that will be analyzed by the AI model.
   ### 2.2 BACK END / AI Middleware
      - Download the ai-server files (unzip if necessary)
      - Create the .env based on .env.dev file with the following parameters:
            OPENAI_API_KEY=YOUR_API_KEY
            CLAUDE_API_KEY=YOUR_API_KEY

            VALIDATE_MODEL=true
            OPENAI_DEFAULT_MODEL=gpt-4o-mini
            OPENAI_MODELS=gpt-4o-mini,gpt-3.5-turbo,gpt-3.5-turbo-0.125,gpt-4-turbo,gpt-4,gpt-4o
            CLAUDE_DEFAULT_MODEL=claude-sonnet-4-20250514
            CLAUDE_MODELS=claude-sonnet-4,claude-sonnet-4-20250514,claude-haiku-4-5,claude-haiku-4-5-20251001

            PORT=3001
            CORS=comma_separated_list_of_allowed_urls_must_include_http
      - Init Node JS project inside the ai-server folder
         npm init -y
      - Install required packages
         npm install express cors dotenv body-parser
      - Install required AI provider packages (you can install all or just the required ones)
          - For OpenAI/ChatGPT
            npm install openai
          - For Anthropic/Claude
            npm install @anthropic-ai/sdk
          - For LocalLLM
            npm install axios
      - Run the server
         node .\ai-server.js 
      - Troubleshooting
         - The server closes as soon as it opens.
           Make sure the server is using an unique PORT, otherwise it won't stay in listen mode
         - An error is thrown as it starts
           Make sure all the ai-server files are inside this folder, and the correct npm packages are installed
         - The server is running, but doesn't return a response, or throws an error when a prompt is processed
           There may be a package missing. The system prompt may be incorrectly set up. The model is not available.
         - The server returns a CORS error.
           Make sure the .env file specifies the domain name where your ExtJS is. For example:
               CORS=https://www.sencha.com
      


## 3. Running the provided examples.
The examples are provided as-is. To get them to run you need to create an Ext JS project with a valid Ext JS license.
The main steps are:
   ### 3.1. Create ExtJS App (either moder or classic)
      3.1.1. To create your new Ext JS application:
         - Commercial Version
            - sencha -sdk [ROUTE_SDK] generate app -[classic|modern] App .\
         - Trial Edition
            - sencha generate app [classic|modern] -ext App .\
      3.1.2. Put the example files in your project (the (modern or classic) app folder and the packages folder)
      3.1.3. Build the Ext JS Project
         - sencha app refresh
         - sencha app build [development|testing|production]
   ### 3.2. Create the NodeJS Data Server
      To create your web server (inside the server folder):
         - npm init -y
         - npm install express cors dotenv body-parser
      3.2.1. Server Setup
            Create the .env file based on the .env.dev to include the server port, and the allowed CORS Origins. For Example:
               PORT=3001
               CORS=comma_separated_list_of_allowed_urls_must_include_http
   ### 3.3. Create the NodeJS Middleware 
      Follow the steps from 2.2
   ### 3.4. Run data and ai servers
      3.4.1 Data Server
            Inside the server folder: node ./server.js
      3.4.2 The AI Middleware Server
            Inside the ai-server folder: node ./ai-server.js
   ### 3.5. Run the Ext JS App
      It is possible to test your app by running app watch or setting a local domain:
      3.5.1 Sencha App Watch
            3.5.1.1 Inside the Ext JS App run the watch command. 
               - sencha app watch
            3.5.1.2 Your Server will be running in your localhost in an specified port (usually: http://localhost:1841)
            3.5.1.3 Make sure you also have the nodejs servers running (steps under 3.4)
            3.5.1.4 Test from the provided localhost domain and port by using a browser window.
      3.5.2 Using your custom domain
            3.5.2.1 Inside the Ext JS App run the refresh and build commands. (Should have already been done on step 3.1.3)
               - sencha app refresh
               - sencha app build [development|testing|production]
            3.5.2.2 Setup and run the server of your choosing pointing to your Sencha Ext JS App.
            3.5.2.3 Make sure you also have the nodejs servers running (steps under 3.4)
            3.5.2.4 Test from your local domain by using a browser window.


## 4. Have fun!