import { Type } from '@google/genai';
import type { FunctionDeclaration } from '@google/genai';

export const SCHEMA_GET_FILES_INFO: FunctionDeclaration = {
    name: "getFilesInfo",
    description: "Lists files in the specified directory along with their sizes, constrained to the working directory.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            directory: {
                type: Type.STRING,
                description: "The directory to list files from, relative to the working directory. If not provided, lists files in the working directory itself.",
            },
        }
    }
}

export const SCHEMA_GET_FILE_CONTENT: FunctionDeclaration = {
    name: "getFileContent",
    description: "Retrieves and returns the content of a specified file within the working directory., first 1000 characters only",
    parameters: {
        type: Type.OBJECT,
        properties: {
            directory: {
                type: Type.STRING,
                description: "The directory to read files from, relative to the working directory.",
            },
            filePath: {
                type: Type.STRING,
                description: "The relative path to the file whose content should be retrieved from the working directory."
            }
        }
    }
}

export const SCHEMA_RUN_PYTHON_FILE: FunctionDeclaration = {
    name: "runPythonFile",
    description: "Executes a Python file within a directory and returns its output or error messages.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            directory: {
                type: Type.STRING,
                description: "The directory to run python files from, relative to the working directory.",
            },
            filePath: {
                type: Type.STRING,
                description: "The path to the Python file to execute, relative to the specified working directory."
            }
        }
    }
}

export const SCHEMA_WRITE_FILE: FunctionDeclaration = {
    name: "writeFile",
    description: "Writes content to a specified file within the working directory, creating or overwriting it.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            directory: {
                type: Type.STRING,
                description: "The directory to run python files from, relative to the working directory.",
            },
            filePath: {
                type: Type.STRING,
                description: "Relative path to the file where content should be written inside the working directory"
            },
            content: {
                type: Type.STRING,
                description: "The text content to be written to the specified file."
            }
        }
    }
}