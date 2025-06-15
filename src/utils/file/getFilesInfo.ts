import path from 'path';
import fs from "node:fs";
import {logError} from "../error/errorUtils"
import {isSubdirectory} from "../path/pathUtils"

type FileInfoResult = [string[], string | null];

export function getFilesInfo(
    workingDirectory: string,
    directory: string | null = null
): FileInfoResult {
    if (!directory) {
        return [[], `directory is required`];
    }

    const resolvedWorkingDirectory = path.resolve(workingDirectory);
    const resolvedDirectory = path.resolve(directory);

    if (!isSubdirectory(resolvedWorkingDirectory, resolvedDirectory)) {
        return [[], `"${directory}" is not a directory`];
    }

    try {
        const result = readDirectoryInfo(resolvedDirectory);

        return [result, null];
    } catch (err) {
        const errorMessage = logError(err, `${getFilesInfo} Encoutered error reading directory`);
        return [[], errorMessage];
    }
}

function readDirectoryInfo(directory: string): string[] {
    const items = fs.readdirSync(directory, { withFileTypes: true })

    return items.map((item) => {
        const fullPath = path.join(directory, item.name);
        const stats = fs.statSync(fullPath);

        return formatFileStat(item.name, stats.size, item.isDirectory());
    });
}

function formatFileStat(name: string, size: number, isDir: boolean): string {
    return `${name}: file_size=${size} bytes, is_dir=${isDir}`;
}
