import path from "node:path"
import fs from "node:fs";
import { isSubdirectory } from "../path/pathUtils";
import { getValidFileStats } from "./fileUtils"
import type { FileActionResponse } from "./fileTypes"

export type GetFileContentProps = { filePath: string };

export function getFileContent(workingDirectory: string, { filePath }: GetFileContentProps): FileActionResponse {
    const resolvedWorkingDirectory = path.resolve(workingDirectory);
    const resolvedFilePath = path.resolve(workingDirectory, filePath);

    if (!isSubdirectory(resolvedWorkingDirectory, resolvedFilePath)) {
        return {
            response: `Error: Cannot read "${filePath}" as it is outside the permitted working directory`,
            ok: false
        };
    }

    const { stats, valid } = getValidFileStats(resolvedFilePath);
    if (!valid) {
        return {
            response: `Error: File not found or is not a regular file: "${filePath}"`,
            ok: false
        };
    }

    let content = fs.readFileSync(resolvedFilePath, { encoding: 'utf-8' })
    if (content.length > 1000) {
        content = content.slice(0, 1000) + `... "${filePath}" truncated at 1000 characters`
    }
    return { response: content, ok: true }
}