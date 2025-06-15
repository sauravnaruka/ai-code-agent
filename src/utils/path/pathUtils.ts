export function isSubdirectory(workingDirectory: string, directory: string): boolean {
    
    return directory.startsWith(workingDirectory)
}
