import path from "node:path";
import { spawn } from "node:child_process";
import {isSubdirectory} from "../path/pathUtils"
import {getValidFileStats} from "../file/fileUtils";

export async function runPythonFile(workingDirectory: string, filePath: string) {
    if(!filePath.endsWith('.py')){
        return `Error: "${filePath}" is not a Python file.`
    }

    const resolvedWorkingDirectory = path.resolve(workingDirectory);
    const resolvedFilePath = path.resolve(filePath);

    if(!isSubdirectory(resolvedWorkingDirectory, resolvedFilePath)) {
        return `Error: Cannot execute "${filePath}" as it is outside the permitted working directory`
    }

    const {valid, stats} = getValidFileStats(resolvedFilePath);
    if(!valid ){
        return `Error: File "${filePath}" not found.`
    }

    try {
        const output = await runWithTimeout(resolvedWorkingDirectory, resolvedFilePath, 30000);
        return output;
    } catch (err: any) {
        return `Error during execution: ${err.message}`;
    }
}

function runWithTimeout(workingDirectory: string, filePath: string, timeout: number): Promise<string> {
    return new Promise((resolve, reject) => {
        const pythonProcess = spawn('python3', [filePath], { cwd: workingDirectory });

        let stdout = '';
        let stderr = '';
        let timeoutHandle: NodeJS.Timeout;

        pythonProcess.stdout.on('data', data => {
            stdout += data.toString();
        });

        pythonProcess.stderr.on('data', data => {
            stderr += data.toString();
        });

        pythonProcess.on('close', code => {
            clearTimeout(timeoutHandle);
            const outputParts = [];

            if (stdout.trim()) outputParts.push(`STDOUT:\n${stdout.trim()}`);
            if (stderr.trim()) outputParts.push(`STDERR:\n${stderr.trim()}`);
            if (code !== 0) outputParts.push(`Process exited with code ${code}`);
            if (outputParts.length === 0) outputParts.push('No output produced.');

            resolve(outputParts.join('\n\n'));
        });

        pythonProcess.on('error', err => {
            clearTimeout(timeoutHandle);
            reject(new Error(`Failed to start process: ${err.message}`));
        });

        timeoutHandle = setTimeout(() => {
            pythonProcess.kill();
            reject(new Error('Execution timed out after 30 seconds.'));
        }, timeout);
    });
}
