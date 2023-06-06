import { SourceFile } from "../../../entities/SourceFile";
export type UnitTestCreatorResponse = {
  filePathsToRead: SourceFile["filePath"][];
  unitTestContent: SourceFile["fileContent"] | null;
  thought: string;
};
export interface UnitTestCreator {
  create(sourceFile: SourceFile): Promise<UnitTestCreatorResponse>;
  addRelatedFileContent(sourceFiles: SourceFile[]): Promise<void>;
  fix(testResult: string): Promise<UnitTestCreatorResponse>;
}
