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

        const subDirReadme = path.join(subDir, 'main.py');
        fs.writeFileSync(subDirReadme, 'print("Hello from Python!")');
    })

    afterAll(() => {
        fs.rmSync(testDir, { recursive: true, force: true });
    });

    it("returns list of directory and files inside of directory", () => {
        const {response, ok} = getFilesInfo(testDir, {directory: "."});

        expect(ok).toBeTruthy();
        expect(response).toMatch(/^- src: file_size=\d+ bytes, is_dir=true$/m);
        expect(response).toMatch(/^- README\.md: file_size=\d+ bytes, is_dir=false$/m);
        expect(response).toMatch(/^- package\.json: file_size=\d+ bytes, is_dir=false$/m);
    })

    it("return the list of files from subdirectory", ()=>{
        const {response, ok} = getFilesInfo(testDir, {directory: "./src"});

        expect(ok).toBeTruthy();
        expect(response).toMatch(/^- main\.py: file_size=\d+ bytes, is_dir=false$/m);
    })

    it("returns an error when directory is outside the working directory", () => {
        const directory = "../"
        const {response, ok} = getFilesInfo(testDir, {directory});

        expect(ok).toBeFalsy();
        expect(response).toContain(`Error: Cannot list "${directory}" as it is outside the permitted working directory`);
    })

    it("returns an error when directory does not exist in the working directory", () => {
        const directory = "./bin";
        const {response, ok}  = getFilesInfo(testDir, {directory: directory});

        expect(ok).toBeFalsy();
        expect(response).toContain(`Error: "${directory}" is not a directory`);
    })
})