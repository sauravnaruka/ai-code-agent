import path from "node:path";
import fs from "node:fs";
import { isSubdirectory } from "../path/pathUtils";
import { logError } from "../error/errorUtils"
import type { FileActionResponse } from "./fileTypes";

export type WriteFileProps = { filePath: string, content: string }

export function writeFile(workingDirectory: string, { filePath, content }: WriteFileProps): FileActionResponse {
    const resolvedWorkingDirectory = path.resolve(workingDirectory);
    const resolvedFilePath = path.resolve(workingDirectory, filePath);

    if (!isSubdirectory(resolvedWorkingDirectory, resolvedFilePath)) {
        return {
            response: `Error: Cannot write to "${filePath}" as it is outside the permitted working directory`,
            ok: false
        }
    }

    try {
        fs.writeFileSync(resolvedFilePath, content, { encoding: 'utf-8' });

        return {
            response: `Successfully wrote to "${filePath}" (${content} characters written)`,
            ok: true
        }
    } catch (err) {
        return {
            response: logError(err, `${writeFile}, writing to file`),
            ok: false
        }
    }
} 