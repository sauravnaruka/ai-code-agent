import dotenv from 'dotenv';
import {GoogleGenAI} from '@google/genai';
import {program} from 'commander'

dotenv.config();
const apiKey = process.env.GEMINI_API_KEY;

program
    .name('main')
    .description('AI Code Assistant')
    .usage('<prompt> [--verbose]')
    .argument('<prompt>', 'the prompt to send to the AI') 
    .option('--verbose', 'print verbose output');

    

async function main(){
    program.parse(process.argv);
    const options = program.opts<{verbose?: boolean}>()
    const userPrompt = program.args[0];

    if(!apiKey) {
        console.log("Error reading config")
        process.exit(1);
    }

    const messages = [
        {
            role: "user",
            parts: [{ text: userPrompt }]
        }
    ]

    const ai = new GoogleGenAI({apiKey})

    try{
        const response = await ai.models.generateContent({
            model:'gemini-2.0-flash-001',
            contents: userPrompt
        })
    
        console.log("AI:", response.text);
        
        const usage = response.usageMetadata;
        if (options.verbose && usage) {
          console.log(`Prompt tokens: ${usage.promptTokenCount}`);
          console.log(`Response tokens: ${usage.candidatesTokenCount}`);
        }

    } catch(err) {
        if(err instanceof Error) {
            console.error("Error generating content:", err.message);
        } else {
            console.error("unknown error:", err);
        }
    }
};

main();