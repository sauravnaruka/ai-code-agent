import fs from "node:fs";
import {logError} from "../error/errorUtils"

type ValidFileStats = 
    | {valid: true, stats: fs.Stats}
    | {valid: false, stats?: never}

export function getValidFileStats(filePath: string): ValidFileStats {
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
        logError(err);
         console.error(`[getValidFileStats] Error checking file "${filePath}":`, err);
    }
    return {valid: false}
}

export function getValidDirectory(filePath: string): ValidFileStats {
    try{
        if(!fs.existsSync(filePath)) {
            return {valid: false}
        }

        const stats = fs.statSync(filePath);
        if(!stats.isDirectory()) {
            return {valid: false}
        }

        return {valid: true, stats}
    } catch(err) {
        logError(err, `[getValidDirectory] Error checking file "${filePath}":`);
    }
    return {valid: false}
}