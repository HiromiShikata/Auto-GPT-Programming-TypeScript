import { FileRepository } from './adapter-interfaces/tools/FileRepository';
import { PatchCreator } from './adapter-interfaces/tools/PatchCreator';
import { SourceFile } from '../entities/SourceFile';
import { BashExecutor } from './adapter-interfaces/tools/BashExecutor';

export class FixErrorUseCase {
  constructor(
    private readonly fileRepository: FileRepository,
    private readonly bashExecutor: BashExecutor,
    private readonly patchCreator: PatchCreator,
  ) {}

  run = async (
    context: string,
    projectRootPath: string,
    testCommand: string,
  ): Promise<void> => {
    let relatedSourceFiles: SourceFile[] = [];
    for (let i = 0; i < 10; i++) {
      const { stderr, stdout, exitStatusCode } =
        await this.bashExecutor.execute(
          `cd ${projectRootPath} && ${testCommand}`,
        );
      if (exitStatusCode === 0) {
        console.log(`stdout: ${stdout}`);
        console.log('✨🎉Finished to fix error🎉✨');
        return;
      }
      console.log(`🔥Failed the test🔥
${i + 1}th try
     
stdout: 
${stdout}

stderr:
${stderr}

start to create patch with files: 
${relatedSourceFiles.map((f) => `  - ${f.filePath}`).join('\n')}
`);
      const errorMessage = `
# executed comma
${testCommand}

# stdout
${stdout}

# stderr
${stderr}
`;
      const res = await this.patchCreator.fix(
        context,
        relatedSourceFiles,
        errorMessage,
      );
      console.log(`Thought: ${res.thoughtJapanese}
File paths to read: ${res.filePathsToRead}
Unified diff formatted patch: 
${res.unifiedDiffFormattedPatch}
`);
      if (res.unifiedDiffFormattedPatch) {
        //           const patchApplyCommand =               `cd ${projectRootPath} && patch -p1 <<'EOF'
        // ${res.unifiedDiffFormattedPatch}
        // EOF
        // `
        const patchApplyCommand = `cd ${projectRootPath} && git apply --ignore-whitespace <<'EOF'
${res.unifiedDiffFormattedPatch}
EOF
`;
        const patchApplyResult = await this.bashExecutor.execute(
          patchApplyCommand,
        );
        if (patchApplyResult.exitStatusCode !== 0) {
          console.error(
            `Failed to apply patch. 
exitStatusCode: ${patchApplyResult.exitStatusCode}
stdout: ${patchApplyResult.stdout}
stderr: ${patchApplyResult.stderr}
command:
${patchApplyCommand}

patchApplyResult:
${JSON.stringify(patchApplyResult)}`,
          );
        }
      }
      relatedSourceFiles = await this.fileRepository.read(
        res.filePathsToRead,
        projectRootPath,
      );
    }
    throw new Error('Failed to fix error');
  };
}
