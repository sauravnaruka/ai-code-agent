import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { getFilesInfo } from "./getFilesInfo";

describe("getFilesInfo", () => {
    let testDir: string;

    beforeAll(() => {
        testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'test-working-dir-'));

        const subDir = path.join(testDir, 'src');
        fs.mkdirSync(subDir);

        const readmePath = path.join(testDir, 'README.md');
        fs.writeFileSync(readmePath, 'Sample readme');

        const pkgJsonPath = path.join(testDir, 'package.json');
        fs.writeFileSync(pkgJsonPath, '{"name": "test"}');
    })

    afterAll(() => {
        fs.rmSync(testDir, { recursive: true, force: true });
    });

    it("returns list of directory and files inside of directory", () => {
        const [entries, err] = getFilesInfo(testDir, testDir);

        expect(err).toBeNull();
        expect(entries.length).toBe(3);

        const sortedEntries = (entries).sort();
        expect(sortedEntries).toEqual(expect.arrayContaining([
            expect.stringMatching(/^README\.md: file_size=\d+ bytes, is_dir=false$/),
            expect.stringMatching(/^package\.json: file_size=\d+ bytes, is_dir=false$/),
            expect.stringMatching(/^src: file_size=\d+ bytes, is_dir=true$/),
        ]));
    })

    it("returns an error when directory is outside the working directory", () => {
        const directory = "../"
        const [entries, err] = getFilesInfo(testDir, directory);

        expect(err).toBe(`"${directory}" is not a directory`);
        expect(entries.length).toBe(0);
    })

    it("returns an error when directory does not exist in the working directory", () => {
        const directory = "/bin"
        const [entries, err] = getFilesInfo(testDir, directory);

        expect(err).toBe(`"${directory}" is not a directory`);
        expect(entries.length).toBe(0);
    })

    it("returns an error when directory is empty", () => {
        const [entries, err] = getFilesInfo(testDir, null);

        expect(err).toBe(`directory is required`);
        expect(entries.length).toBe(0);
    })
})