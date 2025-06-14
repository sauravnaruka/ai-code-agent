import path from 'path';
import fs from "node:fs";

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
        const errorMessage = logError(err);
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

function isSubdirectory(workingDirectory: string, directory: string): boolean {
    return directory.startsWith(workingDirectory)
}

function formatFileStat(name: string, size: number, isDir: boolean): string {
    return `${name}: file_size=${size} bytes, is_dir=${isDir}`;
}

function logError(err: unknown): string {
    let errorMessage = ""
    if (err instanceof Error) {
        errorMessage = "Encoutered error reading directory" + err.message
        console.log(errorMessage)
    } else {
        errorMessage = "Unkown error " + err
        console.log(errorMessage);
    }

    return errorMessage;
}