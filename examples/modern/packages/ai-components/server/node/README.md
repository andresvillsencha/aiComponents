# naturallanguage
AI Backend/Middleware Server. 
This is part 2 of 2 of the Sencha AI Toolkit. These files connect your Sencha App with the AI Provider of your choosing.


To get this to run, you'll need to install Node JS, and enter your API keys in the .env file.

To create your web server (inside the server folder):
- npm init -y
- npm install express cors dotenv body-parser
For Open AI
- npm install openai 
For Anthropic / Claude
- npm install @anthropic-ai/sdk
For Local LLM
- npm install axios

- Make sure you go into .env and update the CORS property with a list of allowed Origins
- Also make sure all your api keys are there

your middleware file structure should look something like this:
endpoints/
node_modules/
.env
.gitignore
ai-server.js
package-lock.json
package.json

To run the server you must run:
- node \ai-server.js