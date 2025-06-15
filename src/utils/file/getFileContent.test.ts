import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { getFileContent } from "./getFileContent";

describe("getFileContent", () => {
    let testDir: string;

    beforeAll(() => {
        testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'test-working-dir-'));

        const subDir = path.join(testDir, 'src');
        fs.mkdirSync(subDir);
    })

    afterAll(() => {
        fs.rmSync(testDir, { recursive: true, force: true });
    });

    it('returns the truncated file content', () => {
        const longContent = 'a'.repeat(1200);
        const longFilePath = path.join(testDir, 'longfile.text');

        fs.writeFileSync(longFilePath, longContent);

        const {file, error} = getFileContent(testDir, longFilePath);

        expect(error).toBeUndefined()
        expect(file?.startsWith('a'.repeat(1000))).toBe(true)
        expect(file).toContain(`"${longFilePath}" truncated at 1000 characters`)
    })

    it('returns an error if file is outside the working directory', () => {
        const filePath = "../main.js";
        const { file, error } = getFileContent(testDir, filePath);

        expect(error).toBe(`Error: Cannot read "${filePath}" as it is outside the permitted working directory`)
    })

    it('returns an error if file is not found', () => {
        const filePath = testDir + "/main.js";
        const { file, error } = getFileContent(testDir, filePath);

        expect(error).toBe(`Error: File not found or is not a regular file: "${filePath}"`)
    })
})