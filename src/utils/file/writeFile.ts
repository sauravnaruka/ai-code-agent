import path from "node:path";
import fs from "node:fs";
import {isSubdirectory} from "../path/pathUtils";
import {logError} from "../error/errorUtils"

export function writeFile(workingDirectory: string, filePath: string, content: string): string {
    const resolvedWorkingDirectory = path.resolve(workingDirectory);
    const resolvedFilePath = path.resolve(filePath);

    if(!isSubdirectory(resolvedWorkingDirectory, resolvedFilePath)){
        return `Error: Cannot write to "${filePath}" as it is outside the permitted working directory`
    }

    try {
        fs.writeFileSync(resolvedFilePath, content, {encoding: 'utf-8'});

        return `Successfully wrote to "${filePath}" (${content} characters written)`

    } catch(err){
        return logError(err, "${writeFile}, writing to file")
    }
} 