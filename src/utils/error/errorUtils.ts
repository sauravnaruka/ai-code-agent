export function logError(err: unknown, context?: string): string {
    let errorMessage = ""
    if (err instanceof Error) {
        errorMessage = `Error: ${context} ${err.message}`
    } else {
        errorMessage = `Error: ${context} ${err}`
    }

    console.log(errorMessage);
    return errorMessage;
}