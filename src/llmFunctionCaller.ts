import type { FunctionCall, Content } from '@google/genai';
import { writeFile, WriteFileProps } from "./utils/file/writeFile";
import { runPythonFile, RunPythonFileProps } from "./utils/file/runPythonFile";
import { getFilesInfo, GetFilesInfoProps } from "./utils/file/getFilesInfo";
import { getFileContent, GetFileContentProps } from "./utils/file/getFileContent";
import type {FileActionResponse} from "./utils/file/fileTypes";

const WORKING_DIRECTORY = "./workspace";

type FunctionPropsMap = {
    writeFile: WriteFileProps;
    runPythonFile: RunPythonFileProps;
    getFilesInfo: GetFilesInfoProps;
    getFileContent: GetFileContentProps;
};

type FunctionMap = {
    [K in keyof FunctionPropsMap]: (workingDirectory: string, props: FunctionPropsMap[K]) => FileActionResponse | Promise<FileActionResponse>;
};


const functionMap: FunctionMap = {
    writeFile,
    runPythonFile,
    getFilesInfo,
    getFileContent,
}

export async function callFunctions(functionCalls: FunctionCall[], verbose: boolean): Promise<Content[]> {
    const responses : Content[] = []
    for (const functionCall of functionCalls) {
        if(!functionCall.name) {
            console.log(`Error: missing function name`);
            continue;
        }

        if (verbose) {
            console.log(`- Calling function: ${functionCall.name}(${JSON.stringify(functionCall.args)})`);
        } else {
            console.log(`- Calling function: ${functionCall.name}`);
        }

        const result = await callFunction(functionCall);
        responses.push(formatResponseContent(functionCall.name, result))
    }

    return responses
}

async function callFunction(functionCall: FunctionCall): Promise<FileActionResponse> {
    const { name, args } = functionCall;

    if (!isFunctionKey(name)) {
        return {response: `Error: Unknown function: ${name}`, ok: false};
    }

    if (typeof args !== "object" || args === null || Array.isArray(args)) {
        return {response: `Error: Invalid arguments for ${name}`, ok: false};
    }

    return await callFunctionHelper(name, args);
}

async function callFunctionHelper<K extends keyof FunctionPropsMap>(
    name: K,
    args: unknown
): Promise<FileActionResponse> {
    const fn = functionMap[name];
    const typedArgs = args as FunctionPropsMap[K];
    return await fn(WORKING_DIRECTORY, typedArgs);
}

function isFunctionKey(key: string | undefined): key is keyof FunctionMap {
    return !!key && key in functionMap;
}

function formatResponseContent(functionName: string, result: FileActionResponse): Content {
    const {response, ok} = result;
    return {
        role: "tool",
        parts: [
            {
                functionResponse: {
                    name: functionName,
                    response: { [ok ? "result": "error"]: response }
                }
            }
        ]
    }
}
