import { SourceFile } from '../../../entities/SourceFile';
export type PatchCreatorResponse = {
  filePathsToRead: SourceFile['filePath'][];
  unifiedDiffFormattedPatch: string | null;
  thought: string;
  thoughtJapanese: string;
  commitMessage: string | null;
};
export interface PatchCreator {
  fix(
    context: string,
    relatedSourceFiles: SourceFile[],
    errorMessage: string,
  ): Promise<PatchCreatorResponse>;
}
