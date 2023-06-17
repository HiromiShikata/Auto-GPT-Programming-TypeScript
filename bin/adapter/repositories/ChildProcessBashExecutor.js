"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChildProcessBashExecutor = void 0;
const child_process_1 = require("child_process");
class ChildProcessBashExecutor {
    constructor() {
        this.execute = (command) => new Promise((resolve) => {
            (0, child_process_1.exec)(command, (error, stdout, stderr) => {
                resolve({
                    command,
                    stdout,
                    stderr,
                    exitStatusCode: error?.code ?? 0,
                });
            });
        });
    }
}
exports.ChildProcessBashExecutor = ChildProcessBashExecutor;
//# sourceMappingURL=ChildProcessBashExecutor.js.map