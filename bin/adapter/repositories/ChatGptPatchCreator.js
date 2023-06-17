"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatGptPatchCreator = void 0;
const dotenv = __importStar(require("dotenv"));
dotenv.config();
class ChatGptPatchCreator {
    constructor(modelName, openai) {
        this.modelName = modelName;
        this.openai = openai;
        this.fix = async (context, relatedSourceFiles, errorMessage) => {
            const prompt = `Please create patch using output format.

# Context
${context} 

# Output format
Please reply using valid JSON format.
Object type is :
type PatchCreatorResponse = {
  filePathsToRead: string[]; // file path you should read to fix this error. It should be relative path from project root. We can't use wildcard. You should choose file from file tree. Maximum patch size is 1kb.
  unifiedDiffFormattedPatch: string | null; // unified diff formatted path file from project root path to fix the error. this must be start with 'diff --git'. it can be apply with 'patch -p1' command. You must generate a definitively correct patch file. Please double check line number. 
  thought: string, // your thought. don't forget escape.
  thoughtJapanese: string, // describe your thought of this response  in Japanese. don't forget escape.
  commitMessage: string | null, // commit message to apply this patch if we have. it should follow conventional-commit.
}

# Rule
Please note that if a CONTRIBUTING.md file is defined in this project, you must add it to filePathsToRead first. It is crucial that you thoroughly understand its contents and adhere to the rules outlined within it. This file provides guidance on how to effectively contribute to the project and ensures the quality and consistency of contributions. Failure to comply with these guidelines may result in your contributions being rejected or requiring extensive revision. Let's work together in respecting and maintaining the standards set forth in the CONTRIBUTING.md to ensure the project's success.

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
        this.executeCompletion = async (prompt) => {
            const completion = await this.openai.createChatCompletion({
                model: this.modelName,
                messages: [
                    {
                        role: 'system',
                        content: 'You are well experienced TypeScript professional engineer.',
                    },
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                n: 1,
            }, {
                timeout: 10 * 60 * 1000,
            });
            const result = completion.data.choices[0].message?.content ?? '';
            const converted = this.convertApiResultToPatchCreatorResponse(result);
            if (!converted) {
                console.error(`can't convert api result. result: ${result}`);
                return null;
            }
            return converted;
        };
        this.readOnlyCodeBlock = (text) => {
            const codeBlockRegex = /```(?:\w+)?\n([\s\S]+?)\n```/g;
            const result = [];
            let match;
            while ((match = codeBlockRegex.exec(text))) {
                if (match.length === 2) {
                    result.push(match[1]);
                }
            }
            return result;
        };
        this.convertApiResultToPatchCreatorResponse = (result) => {
            const isCollectObject = (obj) => {
                return (obj !== null &&
                    typeof obj === 'object' &&
                    'filePathsToRead' in obj &&
                    'unifiedDiffFormattedPatch' in obj &&
                    'thought' in obj &&
                    'commitMessage' in obj);
            };
            try {
                const obj = JSON.parse(result);
                if (isCollectObject(obj)) {
                    return obj;
                }
            }
            catch (e) {
                const codeBlockTexts = this.readOnlyCodeBlock(result);
                if (!codeBlockTexts) {
                    return null;
                }
                for (const text of codeBlockTexts) {
                    try {
                        const obj = JSON.parse(text);
                        if (isCollectObject(obj)) {
                            return obj;
                        }
                    }
                    catch (e) {
                        continue;
                    }
                }
            }
            return null;
        };
    }
}
exports.ChatGptPatchCreator = ChatGptPatchCreator;
//# sourceMappingURL=ChatGptPatchCreator.js.map