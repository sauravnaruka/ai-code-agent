import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { runPythonFile } from "./runPythonFile"

describe("runPythonFile", () => {
    let testDir: string;
    let readmeFilePath: string;
    let sucessFile: string;
    let errorFile: string;
    let stderrFile: string;
    let timeoutFile: string;
    let noopFile: string;

    beforeAll(() => {
        testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'test-working-dir-'));

        readmeFilePath = path.join(testDir, 'README.md');
        fs.writeFileSync(readmeFilePath, 'Sample readme');

        // success.py
        sucessFile = path.join(testDir, 'success.py');
        fs.writeFileSync(sucessFile, 'print("Hello from Python!")');

        // error.py
        errorFile = path.join(testDir, 'error.py');
        fs.writeFileSync(errorFile, 'raise Exception("Boom!")');

        // stderr.py
        stderrFile = path.join(testDir, 'stderr.py');
        fs.writeFileSync(stderrFile, 'import sys; sys.stderr.write("This is an error")');

        // timeout.py
        timeoutFile = path.join(testDir, 'timeout.py');
        fs.writeFileSync(timeoutFile, 'import time; time.sleep(35)');

        // noop.py
        noopFile = path.join(testDir, 'noop.py')
        fs.writeFileSync(noopFile, '')
    })

    afterAll(() => {
        fs.rmSync(testDir, { recursive: true, force: true });
    });

    it("returns an error when file outside the working directory", async () => {
        const filePath = path.join(testDir, "..", "main.py");

        const result = await runPythonFile(testDir, filePath);
        expect(result).toContain(`Error: Cannot execute "${filePath}" as it is outside the permitted working directory`)
    })
    
    it("returns an error when file does not exist", async () => {
        const filePath = path.join(testDir, "main.py");

        const result = await runPythonFile(testDir, filePath);
        expect(result).toContain(`Error: File "${filePath}" not found.`)
    })

    it("returns an error when file is invalid python file", async () => {

        const result = await runPythonFile(testDir, readmeFilePath);
        expect(result).toContain(`Error: "${readmeFilePath}" is not a Python file.`)
    })

    it("captures stdout from a successful script", async () => {
        const result = await runPythonFile(testDir, sucessFile);

        expect(result).toContain("STDOUT:");
        expect(result).toContain("Hello from Python!");
    });

    it("captures stderr and non-zero exit code", async () => {
        const result = await runPythonFile(testDir, errorFile);

        expect(result).toContain("STDERR:");
        expect(result).toContain("Exception");
        expect(result).toContain("Process exited with code");
    });

    it("captures just stderr from a script", async () => {
        const result = await runPythonFile(testDir, stderrFile);

        expect(result).toContain("STDERR:");
        expect(result).toContain("This is an error");
    });

    it("returns timeout error for long-running script", async () => {
        jest.useFakeTimers();
        const promise = runPythonFile(testDir, timeoutFile);
        jest.advanceTimersByTime(30_000);
        const result = await promise;

        expect(result).toContain("Execution timed out after 30 seconds.");
        jest.useRealTimers();
    });

    it("returns 'No output produced.' if nothing is printed", async () => {
        const result = await runPythonFile(testDir, noopFile);

        expect(result).toBe("No output produced.");
    });
})