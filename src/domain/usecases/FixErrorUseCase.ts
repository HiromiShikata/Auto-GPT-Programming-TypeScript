import { FileRepository } from './adapter-interfaces/tools/FileRepository';
import { PatchCreator } from './adapter-interfaces/tools/PatchCreator';
import { SourceFile } from '../entities/SourceFile';
import { BashExecutor } from './adapter-interfaces/tools/BashExecutor';
import { DateTimeRepository } from './adapter-interfaces/DateTimeRepository';

export class FixErrorUseCase {
  constructor(
    private readonly fileRepository: FileRepository,
    private readonly bashExecutor: BashExecutor,
    private readonly patchCreator: PatchCreator,
    private readonly dateTimeRepository: DateTimeRepository,
  ) {}

  run = async (
    context: string,
    projectRootPath: string,
    testCommand: string,
    commandToSeeProjectStructure: string,
  ): Promise<void> => {
    let relatedSourceFiles: SourceFile[] = [];
    const branchName = this.createBranchName(context);
    //     const createBranchResult =await  this.bashExecutor.execute(
    // `cd ${projectRootPath}
    // && git switch -c ${branchName}
    // `)

    for (let i = 0; i < 60; i++) {
      console.log(`${i + 1}th try`);
      const { stderr, stdout, exitStatusCode } =
        await this.bashExecutor.execute(
          `cd ${projectRootPath} && ${commandToSeeProjectStructure} && ${testCommand}`,
        );
      if (exitStatusCode === 0) {
        console.log(`stdout: ${stdout}`);
        console.log('✨🎉Finished to fix error🎉✨');
        return;
      }
      console.log(`🔥Failed the test🔥
     
stdout: 
${stdout}

stderr:
${stderr}

start to create patch with files: 
${relatedSourceFiles.map((f) => `  - ${f.filePath}`).join('\n')}
`);
      const errorMessage = `
# executed command
${testCommand}

# stderr
${stderr}
`;
      const res = await this.patchCreator.fix(
        context,
        relatedSourceFiles,
        errorMessage,
      );
      console.log(`Thought: ${res.thoughtJapanese}
Commit message: ${res.commitMessage}
File paths to read: ${res.filePathsToRead.join(', ')}
Unified diff formatted patch: 
${res.unifiedDiffFormattedPatch ?? 'null'}
`);
      if (res.unifiedDiffFormattedPatch) {
        const patchApplyCommand = `cd ${projectRootPath} && patch --force -p1 <<'EOF'
        ${res.unifiedDiffFormattedPatch}
        EOF
        `;
        const patchApplyResult = await this.bashExecutor.execute(
          patchApplyCommand,
        );
        if (patchApplyResult.exitStatusCode === 0) {
          // const gitOperationResult =             await this.bashExecutor.execute(`cd ${projectRootPath}
          // && git add -A
          // && git commit -m "${res.commitMessage}"
          // && git push
          // && gh pr create --title "${res.commitMessage}" --body "${res.thoughtJapanese}" --repo ${process.env.GITHUB_REPOSITORY}
          // `);
          //           if(gitOperationResult.exitStatusCode === 0){
          //               await this.bashExecutor.execute(`
          // cd ${projectRootPath}
          // && git checkout -b ${gitOperationResult.stdout}
          //               `)
          //
          //           }
        } else {
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
  createBranchName = (context: string): string => {
    const now = this.dateTimeRepository.now();
    const dateTimeText = this.dateTimeRepository.yyyyMMddHHmm(now);
    const illegalCharacters = [
      '~',
      '^',
      ':',
      '\\',
      '*',
      '?',
      '[',
      ']',
      '.',
      '/',
      '@{',
      '.lock',
      String.fromCharCode(127),
    ];

    for (let i = 0; i < 32; i++) {
      illegalCharacters.push(String.fromCharCode(i));
    }

    let newStr = context.trim().toLowerCase();
    illegalCharacters.forEach((char) => {
      const regex = new RegExp(`\\${char}`, 'g');
      newStr = newStr.replace(regex, '-');
    });

    newStr = newStr.replace(/\/+/g, '/');
    newStr = newStr.replace(/^\/+|\/+$/g, '');

    const branchNameSuffix = newStr
      .split(' ')
      .slice(0, 5)
      .join('-')
      .substring(0, 20);
    const branchName = `${dateTimeText}-${branchNameSuffix}`;

    return branchName;
  };
}
