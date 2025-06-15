import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { runPythonFile } from "./runPythonFile"

describe("runPythonFile", () => {
    let testDir: string;
    let readmeFileName: string;
    let sucessFileName: string;
    let errorFileName: string;
    let stderrFileName: string;
    let timeoutFileName: string;
    let noopFileName: string;

    beforeAll(() => {
        testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'test-working-dir-'));

        
        readmeFileName = 'README.md';
        fs.writeFileSync(path.join(testDir, readmeFileName), 'Sample readme');

        // success.py
        sucessFileName = 'success.py';
        fs.writeFileSync(path.join(testDir, sucessFileName), 'print("Hello from Python!")');

        // error.py
        errorFileName = 'error.py';
        fs.writeFileSync(path.join(testDir, errorFileName), 'raise Exception("Boom!")');

        // stderr.py
        stderrFileName = 'stderr.py';
        fs.writeFileSync(path.join(testDir, stderrFileName), 'import sys; sys.stderr.write("This is an error")');

        // timeout.py
        timeoutFileName = 'timeout.py';
        fs.writeFileSync(path.join(testDir, 'timeout.py'), 'import time; time.sleep(35)');

        // noop.py
        noopFileName = 'noop.py';
        fs.writeFileSync(path.join(testDir, 'noop.py'), '')
    })

    afterAll(() => {
        fs.rmSync(testDir, { recursive: true, force: true });
    });

    it("returns an error when file outside the working directory", async () => {
        const filePath = "../main.py";

        const {response, ok} = await runPythonFile(testDir, {filePath});

        expect(ok).toBeFalsy();
        expect(response).toContain(`Error: Cannot execute "${filePath}" as it is outside the permitted working directory`)
    })
    
    it("returns an error when file does not exist", async () => {
        const filePath = "main.py";

        const {response, ok} = await runPythonFile(testDir, {filePath});

        expect(ok).toBeFalsy();
        expect(response).toContain(`Error: File "${filePath}" not found.`)
    })

    it("returns an error when file is invalid python file", async () => {
        const {response, ok} = await runPythonFile(testDir, {filePath: readmeFileName});
        
        expect(ok).toBeFalsy();
        expect(response).toContain(`Error: "${readmeFileName}" is not a Python file.`)
    })

    it("captures stdout from a successful script", async () => {
        const {response, ok} = await runPythonFile(testDir, {filePath: sucessFileName});

        expect(ok).toBeTruthy();
        expect(response).toContain("STDOUT:");
        expect(response).toContain("Hello from Python!");
    });

    it("captures stderr and non-zero exit code", async () => {
        const {response, ok} = await runPythonFile(testDir, {filePath: errorFileName});

        expect(ok).toBeTruthy(); // Exception in the code but not in our execution
        expect(response).toContain("STDERR:");
        expect(response).toContain("Exception");
        expect(response).toContain("Process exited with code");
    });

    it("captures just stderr from a script", async () => {
        const {response, ok} = await runPythonFile(testDir, {filePath: stderrFileName});

        expect(ok).toBeTruthy();
        expect(response).toContain("STDERR:");
        expect(response).toContain("This is an error");
    });

    it("returns timeout error for long-running script", async () => {
        jest.useFakeTimers();
        const promise = runPythonFile(testDir, {filePath: timeoutFileName});
        jest.advanceTimersByTime(30_000);
        const {response, ok} = await promise;

        expect(ok).toBeFalsy();
        expect(response).toContain("Execution timed out after 30 seconds.");
        jest.useRealTimers();
    });

    it("returns 'No output produced.' if nothing is printed", async () => {
        const {response, ok} = await runPythonFile(testDir, {filePath: noopFileName});

        expect(ok).toBeTruthy();
        expect(response).toBe("No output produced.");
    });
})