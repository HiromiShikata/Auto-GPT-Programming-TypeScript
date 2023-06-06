import { ChatGptUnitTestCreator } from "./ChatGptUnitTestCreator";

describe("ChatGptUnitTestCreator", () => {
  describe("readOnlyCodeBlock", () => {
    const sampleResult = `Here is the \`UnitTestCreatorResponse\` in JSON format with the file paths to read and the unit test content to write:

\`\`\`json
{
  "filePathsToRead": [
    "/home/hiromi/git/umino/Auto-GPT-Programming-TypeScript/sample-project/src/domain/usecases/GetUserUseCase.ts"
  ],
  "unitTestContent": "import { UserRepository } from \\"./adapter-interfaces/UserRepository\\";\\nimport { User } from \\"../entities/User\\";\\nimport { GetUserUseCase } from \\"./GetUserUseCase\\";\\n\\ndescribe(\\"GetUserUseCase\\", () => {\\n  let userRepository: UserRepository;\\n  let getUserUseCase: GetUserUseCase;\\n\\n  beforeEach(() => {\\n    userRepository = {\\n      getById: jest.fn(),\\n    };\\n    getUserUseCase = new GetUserUseCase(userRepository);\\n  });\\n\\n  afterEach(() => {\\n    jest.resetAllMocks();\\n  });\\n\\n  it(\\"should throw an error if id is missing\\", async () => {\\n    await expect(getUserUseCase.execute(null)).rejects.toThrow(\\n      \\"id is required\\"\\n    );\\n  });\\n\\n  it(\\"should throw an error if user is not found\\", async () => {\\n    const id = \\"123\\";\\n    userRepository.getById.mockResolvedValueOnce(null);\\n\\n    await expect(getUserUseCase.execute(id)).rejects.toThrow(\\n      \`\${id} is not found\`\\n    );\\n  });\\n\\n  it(\\"should return user if user is found\\", async () => {\\n    const id = \\"123\\";\\n    const user = { id } as User;\\n    userRepository.getById.mockResolvedValueOnce(user);\\n\\n    const result = await getUserUseCase.execute(id);\\n\\n    expect(userRepository.getById).toHaveBeenCalledWith(id);\\n    expect(result).toEqual(user);\\n  });\\n});\\n",
  "thought": "The unit test file imports the necessary modules and describes a test suite for the GetUserUseCase. The 'beforeEach' and 'afterEach' functions are used to reset the mocks before and after each test, respectively. The 'it' function contains three test cases: one to check if the function throws an error when the id is missing, another to check if the function throws an error when the user is not found, and a third to check if the function returns the user when the user is found. The function is tested by mocking the UserRepository and calling getUserUseCase.execute() with appropriate arguments."
}
\`\`\`

The \`unitTestContent\` field contains the content of the unit test file that will be created for the \`GetUserUseCase\` module. The \`describe\` and \`it\` functions are used to organize and run the different tests. The \`beforeEach\` and \`afterEach\` functions are used to set up and tear down the test environment, respectively. The test cases use the Jest framework's mock functionality to test the \`execute\` function of the GetUserUseCase module. This unit test file is written in TypeScript to take advantage of its static typing and other features.`;
    test.each`
      input                          | expected
      ${"aaa```\ntest\n```bbb"}      | ${"\ntest\n"}
      ${"aaa```\nte\nst\n```bbb"}    | ${"\nte\nst\n"}
      ${"aaa```\ntest\ntest2```bbb"} | ${"\ntest\ntest2"}
      ${"aaa```json\ntest\n```bbb"}  | ${"test\n"}
      ${sampleResult} | ${`{
  "filePathsToRead": [
    "/home/hiromi/git/umino/Auto-GPT-Programming-TypeScript/sample-project/src/domain/usecases/GetUserUseCase.ts"
  ],
  "unitTestContent": "import { UserRepository } from \\"./adapter-interfaces/UserRepository\\";\\nimport { User } from \\"../entities/User\\";\\nimport { GetUserUseCase } from \\"./GetUserUseCase\\";\\n\\ndescribe(\\"GetUserUseCase\\", () => {\\n  let userRepository: UserRepository;\\n  let getUserUseCase: GetUserUseCase;\\n\\n  beforeEach(() => {\\n    userRepository = {\\n      getById: jest.fn(),\\n    };\\n    getUserUseCase = new GetUserUseCase(userRepository);\\n  });\\n\\n  afterEach(() => {\\n    jest.resetAllMocks();\\n  });\\n\\n  it(\\"should throw an error if id is missing\\", async () => {\\n    await expect(getUserUseCase.execute(null)).rejects.toThrow(\\n      \\"id is required\\"\\n    );\\n  });\\n\\n  it(\\"should throw an error if user is not found\\", async () => {\\n    const id = \\"123\\";\\n    userRepository.getById.mockResolvedValueOnce(null);\\n\\n    await expect(getUserUseCase.execute(id)).rejects.toThrow(\\n      \`\${id} is not found\`\\n    );\\n  });\\n\\n  it(\\"should return user if user is found\\", async () => {\\n    const id = \\"123\\";\\n    const user = { id } as User;\\n    userRepository.getById.mockResolvedValueOnce(user);\\n\\n    const result = await getUserUseCase.execute(id);\\n\\n    expect(userRepository.getById).toHaveBeenCalledWith(id);\\n    expect(result).toEqual(user);\\n  });\\n});\\n",
  "thought": "The unit test file imports the necessary modules and describes a test suite for the GetUserUseCase. The 'beforeEach' and 'afterEach' functions are used to reset the mocks before and after each test, respectively. The 'it' function contains three test cases: one to check if the function throws an error when the id is missing, another to check if the function throws an error when the user is not found, and a third to check if the function returns the user when the user is found. The function is tested by mocking the UserRepository and calling getUserUseCase.execute() with appropriate arguments."
}
`}
    `(
      `
    $input $expected
    `,
      async ({
        input,
        expected,
      }: {
        input: string;
        expected: string | null;
      }) => {
        const unitTestCreator = new ChatGptUnitTestCreator();
        const result = unitTestCreator.readOnlyCodeBlock(input);
        expect(result).toEqual(expected);
      }
    );
  });
});
