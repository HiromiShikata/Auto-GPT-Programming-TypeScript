import { BashExecutor } from '../../domain/usecases/adapter-interfaces/tools/BashExecutor';
import { exec } from 'child_process';

export class ChildProcessBashExecutor implements BashExecutor {
  execute = (
    command: string,
  ): Promise<{
    command: string;
    stdout: string;
    stderr: string;
    exitStatusCode: number;
  }> =>
    new Promise<{
      command: string;
      stdout: string;
      stderr: string;
      exitStatusCode: number;
    }>((resolve) => {
      exec(command, (error, stdout, stderr) => {
        resolve({
          command,
          stdout,
          stderr,
          exitStatusCode: error?.code ?? 0,
        });
      });
    });
}
