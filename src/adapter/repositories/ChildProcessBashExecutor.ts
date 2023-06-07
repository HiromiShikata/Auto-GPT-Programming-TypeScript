import { BashExecutor } from '../../domain/usecases/adapter-interfaces/tools/BashExecutor';

export class ChildProcessBashExecutor implements BashExecutor {
  constructor() {}

  execute = (
    command: string,
  ): Promise<{
    command: string;
    stdout: string;
    stderr: string;
    exitStatusCode: number;
  }> =>
    new Promise(async (resolve, reject) => {
      const { exec } = await import('child_process');
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
