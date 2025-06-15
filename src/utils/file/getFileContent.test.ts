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
        const fileName = 'longfile.txt';
        const longContent = 'a'.repeat(1200);
        const longFilePath = path.join(testDir, fileName);
        fs.writeFileSync(longFilePath, longContent);

        const {response, ok} = getFileContent(testDir, {filePath: fileName});

        expect(ok).toBeTruthy();
        expect(response.startsWith('a'.repeat(1000))).toBe(true)
        expect(response).toContain(`"${fileName}" truncated at 1000 characters`)
    })

    it('returns an error if file is outside the working directory', () => {
        const filePath = path.join("..", "main.js");
        const {response, ok} = getFileContent(testDir, {filePath});

        expect(ok).toBeFalsy();
        expect(response).toBe(`Error: Cannot read "${filePath}" as it is outside the permitted working directory`)
    })

    it('returns an error if file is not found', () => {
        const filePath = "main.js";
        const {response, ok} = getFileContent(testDir, {filePath});

        expect(ok).toBeFalsy();
        expect(response).toBe(`Error: File not found or is not a regular file: "${filePath}"`)
    })
})