export interface BashExecutor {
  execute(command: string): Promise<{
    command: string;
    stdout: string;
    stderr: string;
    exitStatusCode: number;
  }>;
}
