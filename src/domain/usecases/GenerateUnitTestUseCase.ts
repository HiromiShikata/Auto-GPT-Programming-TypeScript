import { FileRepository } from "./adapter-interfaces/tools/FileRepository";
import { TestExecutor } from "./adapter-interfaces/tools/TestExecutor";
import { UnitTestCreator } from "./adapter-interfaces/tools/UnitTestCreator";

export class GenerateUnitTestUseCase {
  constructor(
    private readonly fileRepository: FileRepository,
    private readonly testExecutor: TestExecutor,
    private readonly unitTestCreator: UnitTestCreator
  ) {}

  run = async (filePath: string, testCommand: string): Promise<void> => {
    const unitTestFilePath = filePath.replace(".ts", ".test.ts");
    const [targetSourceFile] = await this.fileRepository.read([filePath]);
    if (!targetSourceFile) {
      throw new Error(`file can't read. path: ${filePath}`);
    }
    for (let i = 0; i < 100; i++) {
      const res = await this.unitTestCreator.create(targetSourceFile);
      const sourceFilesToRead = await this.fileRepository.read(
        res.filePathsToRead
      );
      await this.unitTestCreator.addRelatedFileContent(sourceFilesToRead);
      if (!res.unitTestContent) {
        continue;
      }
      await this.fileRepository.write({
        filePath: unitTestFilePath,
        fileContent: res.unitTestContent,
      });
      break;
    }
    for (let i = 0; i < 5; i++) {
      const { stderr, exitStatusCode } = await this.testExecutor.execute(
        testCommand
      );
      if (exitStatusCode === 0) {
        break;
      }
      const res = await this.unitTestCreator.fix(stderr);
      const sourceFilesToRead = await this.fileRepository.read(
        res.filePathsToRead
      );
      await this.unitTestCreator.addRelatedFileContent(sourceFilesToRead);
      if (!res.unitTestContent) {
        continue;
      }
      await this.fileRepository.write({
        filePath: unitTestFilePath,
        fileContent: res.unitTestContent,
      });
    }
    console.log(`unit test file is generated. path: ${unitTestFilePath}`);
  };
}
