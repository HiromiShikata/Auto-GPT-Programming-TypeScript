import { SourceFile } from "../../../entities/SourceFile";

export interface FileRepository {
  write(sourceFile: SourceFile): Promise<void>;
  read(
    filePaths: SourceFile["filePath"][],
    projectRootPath: string
  ): Promise<SourceFile[]>;
}
