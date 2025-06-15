import path from 'path';
import fs from "node:fs";
import { logError } from "../error/errorUtils"
import { isSubdirectory } from "../path/pathUtils"
import { getValidDirectory } from "./fileUtils";
import type { FileActionResponse } from "./fileTypes"

export type GetFilesInfoProps = { directory: string }

export function getFilesInfo(
    workingDirectory: string,
    { directory = "./" }: GetFilesInfoProps
): FileActionResponse {
    const resolvedWorkingDirectory = path.resolve(workingDirectory);
    const resolvedDirectory = path.resolve(workingDirectory, directory);

    if (!isSubdirectory(resolvedWorkingDirectory, resolvedDirectory)) {
        return {
            response: `Error: Cannot list "${directory}" as it is outside the permitted working directory`,
            ok: false
        };
    }

    const { valid } = getValidDirectory(resolvedDirectory);
    if (!valid) {
        return {
            response: `Error: "${directory}" is not a directory`,
            ok: false
        }
    }

    try {
        return {
            response: readDirectoryInfo(resolvedDirectory),
            ok: true
        };
    } catch (err) {
        return {
            response: logError(err, `${getFilesInfo} Encoutered error reading directory`),
            ok: false
        };
    }
}

function readDirectoryInfo(directory: string): string {
    const items = fs.readdirSync(directory, { withFileTypes: true })

    const filesInfo = items.map((item) => {
        const fullPath = path.join(directory, item.name);
        const stats = fs.statSync(fullPath);

        return formatFileStat(item.name, stats.size, item.isDirectory());
    });

    return filesInfo.join("\n")
}

function formatFileStat(name: string, size: number, isDir: boolean): string {
    return `- ${name}: file_size=${size} bytes, is_dir=${isDir}`;
}
