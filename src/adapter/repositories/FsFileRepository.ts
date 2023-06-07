import { FileRepository } from "../../domain/usecases/adapter-interfaces/tools/FileRepository";
import * as fs from "fs";
import { SourceFile } from "../../domain/entities/SourceFile";

export class FsFileRepository implements FileRepository {
  read = async (
    filePaths: SourceFile["filePath"][],
    projectRootPath: string
  ): Promise<SourceFile[]> => {
    const res = filePaths
      .map((filePath) => {
        try {
          const fileContent = fs
            .readFileSync(`${projectRootPath}/${filePath}`)
            .toString();
          return {
            filePath: filePath,
            fileContent,
          };
        } catch (e) {
          return null;
        }
      })
      .filter((v): v is SourceFile => v !== null);
    return res;
  };
  write = async (sourceFile: SourceFile): Promise<void> => {
    fs.writeFileSync(sourceFile.filePath, sourceFile.fileContent);
  };
}
