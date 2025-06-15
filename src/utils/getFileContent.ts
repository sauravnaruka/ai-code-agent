import path from "node:path"
import fs from "node:fs";
import {isSubdirectory} from "./getFilesInfo";

type FileContent =
  | { file: string; error?: never }
  | { error: string; file?: never };


export function getFileContent(workingDirectory: string, filePath: string): FileContent {
    const resolvedWorkingDirectory = path.resolve(workingDirectory);
    const resolvedFilePath = path.resolve(filePath);

    if(!isSubdirectory(resolvedWorkingDirectory, resolvedFilePath)) {
        return {error: `Error: Cannot read "${filePath}" as it is outside the permitted working directory`}
    }

    const {stats, valid} = getValidFileStats(resolvedFilePath);
    if(!valid){
        return {error: `Error: File not found or is not a regular file: "${filePath}"`}
    }

    let content = fs.readFileSync(resolvedFilePath, {encoding: 'utf-8'})
    if(content.length > 1000){
        content = content.slice(0, 1000) + ` "${filePath}" truncated at 1000 characters`
    }
    return {file: content}
}

type ValidFileStats = 
    | {valid: true, stats: fs.Stats}
    | {valid: false, stats?: never}

function getValidFileStats(filePath: string): ValidFileStats {
    try{
        if(!fs.existsSync(filePath)) {
            return {valid: false}
        }

        const stats = fs.statSync(filePath);
        if(!stats.isFile()) {
            return {valid: false}
        }

        return {valid: true, stats}
    } catch(err) {
        console.log(err);
    }
    return {valid: false}
}