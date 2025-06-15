import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { writeFile } from "./writeFile";

describe("writeFile.ts", () => {
    let testDir: string;

    beforeAll(() => {
        testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'test-working-dir-'));

        const subDir = path.join(testDir, 'src');
        fs.mkdirSync(subDir);
    })

    afterAll(() => {
        fs.rmSync(testDir, { recursive: true, force: true });
    });

    it("writes content into the file", () => {
        const filePath = "sample.txt";
        const content = "Sample text";
        const {response, ok} = writeFile(testDir, {filePath, content: "Sample text"});

        expect(ok).toBeTruthy();
        expect(response).toContain(`Successfully wrote to "${filePath}"`);

        const resolvedFilePath = path.resolve(testDir, filePath);
        let writtenContent = fs.readFileSync(resolvedFilePath, { encoding: 'utf-8' });
        expect(writtenContent).toBe(content);
    })


    it("returns error when file path is outside of the working directory", () => {
        const outsidePath = "../outside.txt";
        const {response, ok} = writeFile(testDir, {filePath: outsidePath, content: "Sample text"});

        expect(ok).toBeFalsy();
        expect(response).toContain(`Error: Cannot write to "${outsidePath}" as it is outside the permitted working directory`)
    })

    it("handles file system error", () => {
        const spy = jest.spyOn(fs, 'writeFileSync').mockImplementation(() => {
            throw new Error("Disk full");
        });

        const filePath = "sample.txt";
        const {response, ok} = writeFile(testDir, {filePath, content: "text"});

        expect(ok).toBeFalsy();
        expect(response).toContain("Disk full");
        expect(response).toContain("Error:");
    });
})