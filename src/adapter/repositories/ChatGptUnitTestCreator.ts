import {
  UnitTestCreator,
  UnitTestCreatorResponse,
} from "../../domain/usecases/adapter-interfaces/tools/UnitTestCreator";
import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from "openai";
import * as dotenv from "dotenv";
import { SourceFile } from "../../domain/entities/SourceFile";

dotenv.config();

export class ChatGptUnitTestCreator implements UnitTestCreator {
  messages: ChatCompletionRequestMessage[] = [];
  openai: OpenAIApi;
  sourceFiles: SourceFile[] = [];

  constructor() {
    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.openai = new OpenAIApi(configuration);

    this.messages.push({
      role: "system",
      content: `You are a experienced software engineer for 20 years.

Please response next action using JSON format.
Object type is :
type UnitTestCreatorResponse = {
  filePathsToRead: string[]; // file path you want to read if you have. It should be absolute path.
  unitTestContent: string | null; // unit test content you want to write.
  thought: string, // your thought.
}
`,
    });
  }

  create = async ({
    filePath,
    fileContent,
  }: SourceFile): Promise<UnitTestCreatorResponse> => {
    const prompt = `Please make unit test file with jest in TypeScript.
# Test target
## File path
${filePath}

## File content
\`\`\`
${fileContent}
\`\`\`


`;

    for (let i = 0; i < 5; i++) {
      const result = await this.executeCompletion(prompt);
      if (result) {
        return result;
      }
    }
    throw new Error("can't create unit test");
  };
  fix = async (testResult: string): Promise<UnitTestCreatorResponse> => {
    const prompt = `Please output new test code to fix this test error.

# Test result
\`\`\`
${testResult}
\`\`\`
`;
    for (let i = 0; i < 5; i++) {
      const result = await this.executeCompletion(prompt);
      if (result) {
        return result;
      }
    }
    throw new Error("can't create unit test");
  };
  addRelatedFileContent = async (sourceFiles: SourceFile[]): Promise<void> => {
    this.sourceFiles.push(...sourceFiles);
  };

  private executeCompletion = async (
    prompt: string
  ): Promise<UnitTestCreatorResponse | null> => {
    const promptWithRelatedFiles = `
${prompt}

${this.sourceFiles
  .map(
    (sourceFile) => `## Related file
### File path
${sourceFile.filePath}
\`\`\`
${sourceFile.fileContent}
\`\`\`
`
  )
  .join("\n")}
`;
    this.sourceFiles = [];
    this.messages.push({
      role: "user",
      content: promptWithRelatedFiles,
    });
    const completion = await this.openai.createChatCompletion(
      {
        model: "gpt-3.5-turbo",
        messages: this.messages,
        n: 1,
      },
      {
        timeout: 10 * 60 * 1000,
      }
    );
    const result = completion.data.choices[0].message?.content ?? "";
    const converted = this.convertApiResultToUnitTestCreatorResponse(result);
    if (!converted) {
      return null;
    }
    if (
      converted.filePathsToRead.find((filePath) => !filePath.startsWith("/"))
    ) {
      console.error(
        `file path should be absolute path. ${converted.filePathsToRead.join(
          ", "
        )})}}`
      );
      return null;
    }
    this.messages.push({
      role: "assistant",
      content: result,
    });
    return converted;
  };

  readOnlyCodeBlock = (text: string): string | null => {
    const codeBlockRegex = /```(?:\w+\n)?([\s\S]+?)```/g;
    const ma;
    let match;
    while ((match = codeBlockRegex.exec(text)) !== null) {
      if (match.length === 2) {
        return match[1];
      }
    }
    return null;
  };
  convertApiResultToUnitTestCreatorResponse = (
    result: string
  ): UnitTestCreatorResponse | null => {
    const isCollectObject = (obj: unknown): obj is UnitTestCreatorResponse => {
      return (
        obj !== null &&
        typeof obj === "object" &&
        "filePathsToRead" in obj &&
        "unitTestContent" in obj &&
        "thought" in obj
      );
    };
    try {
      const obj: unknown = JSON.parse(result);
      if (isCollectObject(obj)) {
        return obj;
      }
    } catch (e) {
      const codeBlockText = this.readOnlyCodeBlock(result);
      if (!codeBlockText) {
        return null;
      }
      try {
        const obj: unknown = JSON.parse(codeBlockText);
        if (isCollectObject(obj)) {
          return obj;
        }
      } catch (e) {
        return null;
      }
    }
    return null;
  };
}
