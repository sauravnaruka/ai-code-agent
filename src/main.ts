import dotenv from 'dotenv';
import { GoogleGenAI, Content } from '@google/genai';
import { program } from 'commander'
import { SYSTEM_PROMPT } from "./llmPrompts";
import { callFunctions } from "./llmFunctionCaller";
import { SCHEMA_GET_FILES_INFO, SCHEMA_GET_FILE_CONTENT, SCHEMA_RUN_PYTHON_FILE, SCHEMA_WRITE_FILE } from "./llmDefinitions";

dotenv.config();
const apiKey = process.env.GEMINI_API_KEY;

program
    .name('main')
    .description('AI Code Assistant')
    .usage('<prompt> [--verbose]')
    .argument('<prompt>', 'the prompt to send to the AI')
    .option('--verbose', 'print verbose output');

async function main() {
    program.parse(process.argv);
    const options = program.opts<{ verbose?: boolean }>()
    const userPrompt = program.args[0];

    if (!apiKey) {
        console.log("Error reading config")
        process.exit(1);
    }

    const messages: Content[] = [
        {
            role: "user",
            parts: [{ text: userPrompt }]
        }
    ]

    const ai = new GoogleGenAI({ apiKey })

    let response;
    try {
        for (let i = 0; i < 20; i++) {
            response = await ai.models.generateContent({
                model: 'gemini-2.0-flash-001',
                contents: messages,
                config: {
                    systemInstruction: SYSTEM_PROMPT,
                    tools: [{
                        functionDeclarations: [
                            SCHEMA_GET_FILES_INFO,
                            SCHEMA_GET_FILE_CONTENT,
                            SCHEMA_RUN_PYTHON_FILE,
                            SCHEMA_WRITE_FILE
                        ]
                    }]
                }
            })

            let functionCalled = false;

            response.candidates?.forEach((candidate)=>{
                if(candidate.content){
                    messages.push(candidate.content)
                    console.log(candidate.content?.parts?.[0]?.functionResponse?.response);
                }
            })

            if (response.functionCalls) {
                functionCalled = true;
                const responses = await callFunctions(response.functionCalls, options.verbose ?? false);

                for (const response of responses) {
                    console.log(response?.parts?.[0]?.functionResponse?.response);
                    messages.push(response)
                }
            }

            if(!functionCalled) break;
        }

        console.log("AI:", response?.text);

        const usage = response?.usageMetadata;
        if (options.verbose && usage) {
            console.log(`Prompt tokens: ${usage.promptTokenCount}`);
            console.log(`Response tokens: ${usage.candidatesTokenCount}`);
        }

    } catch (err) {
        if (err instanceof Error) {
            console.error("Error generating content:", err.message);
        } else {
            console.error("unknown error:", err);
        }
    }
}


main();