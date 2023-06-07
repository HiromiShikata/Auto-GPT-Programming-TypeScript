import { Configuration, OpenAIApi } from 'openai';
import * as dotenv from 'dotenv';
import {
  PatchCreator,
  PatchCreatorResponse,
} from '../../domain/usecases/adapter-interfaces/tools/PatchCreator';
import { SourceFile } from '../../domain/entities/SourceFile';

dotenv.config();

export class ChatGptPatchCreator implements PatchCreator {
  constructor(
    private readonly modelName: 'gpt-3.5-turbo' | 'gpt-4',
    private readonly openai: OpenAIApi,
  ) {}

  fix = async (
    context: string,
    relatedSourceFiles: SourceFile[],
    errorMessage: string,
  ): Promise<PatchCreatorResponse> => {
    const prompt = `Please create patch using output format.

# Context
${context} 

# Output format
Please reply using valid JSON format.
Object type is :
type PatchCreatorResponse = {
  filePathsToRead: string[]; // file path you should read to fix this error. It should be relative path from project root.
  unifiedDiffFormattedPatch: string | null; // unified diff formatted path file from project root path to fix the error. this must be start with 'diff --git'. it can be apply with 'patch -p1' command.
  thought: string, // your thought. don't forget escape.
  thoughtJapanese: string, // describe your thought of this response  in Japanese. don't forget escape.
}

# Error message
\`\`\`
${errorMessage}
\`\`\`

# Related source files
${relatedSourceFiles
  .map((sourceFile) => {
    return `## ${sourceFile.filePath}
\`\`\`
${sourceFile.fileContent}
\`\`\`
`;
  })
  .join('\n')}

`;
    for (let i = 0; i < 5; i++) {
      const result = await this.executeCompletion(prompt);
      if (result) {
        return result;
      }
    }
    throw new Error("can't create unit test");
  };

  private executeCompletion = async (
    prompt: string,
  ): Promise<PatchCreatorResponse | null> => {
    const completion = await this.openai.createChatCompletion(
      {
        model: this.modelName,
        messages: [
          {
            role: 'system',
            content:
              'You are well experienced TypeScript professional engineer.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        n: 1,
      },
      {
        timeout: 10 * 60 * 1000,
      },
    );
    const result = completion.data.choices[0].message?.content ?? '';
    const converted = this.convertApiResultToPatchCreatorResponse(result);
    if (!converted) {
      console.error(`can't convert api result. result: ${result}`);
      return null;
    }
    return converted;
  };

  readOnlyCodeBlock = (text: string): string[] => {
    const codeBlockRegex = /```(?:\w+)?\n([\s\S]+?)\n```/g;
    const result: string[] = [];
    let match;
    while ((match = codeBlockRegex.exec(text))) {
      if (match.length === 2) {
        result.push(match[1]);
      }
    }
    return result;
  };
  convertApiResultToPatchCreatorResponse = (
    result: string,
  ): PatchCreatorResponse | null => {
    const isCollectObject = (obj: unknown): obj is PatchCreatorResponse => {
      return (
        obj !== null &&
        typeof obj === 'object' &&
        'filePathsToRead' in obj &&
        'unifiedDiffFormattedPatch' in obj &&
        'thought' in obj
      );
    };
    try {
      const obj: unknown = JSON.parse(result);
      if (isCollectObject(obj)) {
        return obj;
      }
    } catch (e) {
      const codeBlockTexts = this.readOnlyCodeBlock(result);
      if (!codeBlockTexts) {
        return null;
      }
      for (const text of codeBlockTexts) {
        try {
          const obj: unknown = JSON.parse(text);
          if (isCollectObject(obj)) {
            return obj;
          }
        } catch (e) {
          continue;
        }
      }
    }
    return null;
  };
}
