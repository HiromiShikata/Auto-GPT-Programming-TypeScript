import { ChatGptPatchCreator } from "./ChatGptPatchCreator";
import { ChatGptUnitTestCreator } from "./ChatGptUnitTestCreator";

describe("ChatGptPatchCreator", () => {
  test("tmp", () => {
    const jsonText = `{
  "filePathsToRead": [
    "/home/hiromi/git/umino/Auto-GPT-Programming-TypeScript/sample-project/src/domain/usecases/adapter-interfaces/UserRepository.ts",
    "/home/hiromi/git/umino/Auto-GPT-Programming-TypeScript/sample-project/src/domain/usecases/GetUserUseCase.test.ts"
  ],
  "patch": "@@ -8,7 +8,7 @@ import { UserRepository } from '../adapter-interfaces/UserRepository'; \\n export class GetUserUseCase {\\n   private userRepository: UserRepository;\\n \\n-  constructor(userRepository: UserRepository) {\\n+  constructor(userRepository: { create: (user: User) => Promise<void>, getById: (id: string) => Promise<User> }) {\\n     this.userRepository = userRepository;\\n   }\\n \\n",
  "thought": "The 'UserRepository' is imported from 'UserRepository.ts', where the User model is defined, but 'create' method is undefined here. The test is trying to create a new User with the unknown model. I need to fix the 'create' method in 'UserRepository.ts', so 'GetUserUseCase.test.ts' can recognize it. I also need to return a valid User instance instead of null.",
  "thoughtJapanese": " 'UserRepository' は 'UserRepository.ts' からインポートされており、ここでは 'create' メソッドが未定義です。テストは、未知のモデルで新しい User を作成しようとしています。私は 'UserRepository.ts' の 'create' メソッドを修正して、'GetUserUseCase.test.ts' がそれを認識できるようにする必要があります。また、null ではなく有効な User インスタンスを返す必要があります。",
  "thoughtSpanish": "El 'UserRepository' se importa de 'UserRepository.ts', donde se define el modelo de usuario, pero el método 'create' no está definido aquí. La prueba intenta crear un nuevo usuario con el modelo desconocido. Necesito arreglar el método 'create' en 'UserRepository.ts', para que 'GetUserUseCase.test.ts' lo reconozca. También necesito devolver una instancia de usuario válida en lugar de null.",
  "thoughtFrench": "Le 'UserRepository' est importé depuis 'UserRepository.ts', où le modèle User est défini, mais la méthode 'create' n'est pas définie ici. Le test essaie de créer un nouvel utilisateur avec le modèle inconnu. Je dois corriger la méthode 'create' dans 'UserRepository.ts', afin que 'GetUserUseCase.test.ts' le reconnaisse. Je dois également renvoyer une instance User valide au lieu de null."
}`;
    const json = JSON.parse(jsonText);
  });
  describe("fix", () => {
    jest.setTimeout(10 * 60 * 1000);

    test("should be return filePaths", async () => {
      const creator = new ChatGptPatchCreator();
      const result = await creator.fix(
        `I made test The test for /home/hiromi/git/umino/Auto-GPT-Programming-TypeScript/sample-project/src/domain/usecases/GetUserUseCase.ts .
      But it looks wrong.
      `,
        [],
        `npm run build

> sample-project@1.0.0 build /home/hiromi/git/umino/Auto-GPT-Programming-TypeScript/sample-project
> tsc

src/domain/usecases/GetUserUseCase.test.ts:10:5 - error TS2741: Property 'create' is missing in type '{ getById: (id: string) => Promise<User>; }' but required in type 'UserRepository'.

10     userRepository = {
       ~~~~~~~~~~~~~~

  src/domain/usecases/adapter-interfaces/UserRepository.ts:5:3
    5   create(user: User): Promise<void>;
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    'create' is declared here.

src/domain/usecases/GetUserUseCase.test.ts:13:22 - error TS2693: 'User' only refers to a type, but is being used as a value here.

13           return new User("1", "John");
                        ~~~~

src/domain/usecases/GetUserUseCase.test.ts:15:11 - error TS2322: Type 'null' is not assignable to type 'User'.

15           return null;
             ~~~~~~~~~~~~


Found 3 errors in the same file, starting at: src/domain/usecases/GetUserUseCase.test.ts:10

npm ERR! code ELIFECYCLE
npm ERR! errno 2
npm ERR! sample-project@1.0.0 build: \`tsc\`
npm ERR! Exit status 2
npm ERR! 
npm ERR! Failed at the sample-project@1.0.0 build script.
npm ERR! This is probably not a problem with npm. There is likely additional logging output above.

npm ERR! A complete log of this run can be found in:
npm ERR!     /home/hiromi/.npm/_logs/2023-06-06T14_26_01_793Z-debug.log
hiromi@202303:~/git/umino/Auto-GPT-Programming-TypeScript/sample-project$ 

`
      );
      expect(result.filePathsToRead.length).toBeGreaterThan(0);
      expect(result.thought.length).toBeGreaterThan(0);
      expect(result.thoughtJapanese.length).toBeGreaterThan(0);
    });
    test("second time / should be return filePaths or patch", async () => {
      const creator = new ChatGptPatchCreator();
      const result = await creator.fix(
        `I made test The test for /home/hiromi/git/umino/Auto-GPT-Programming-TypeScript/sample-project/src/domain/usecases/GetUserUseCase.ts .
But it looks wrong.
      `,
        [
          {
            filePath: `/home/hiromi/git/umino/Auto-GPT-Programming-TypeScript/sample-project/src/domain/usecases/GetUserUseCase.test.ts`,
            fileContent: `import { UserRepository } from "./adapter-interfaces/UserRepository";
import { User } from "../entities/User";

export class GetUserUseCase {
  constructor(readonly userRepository: UserRepository) {}

  execute = async (id: string | null): Promise<User> => {
    if (!id) throw new Error("id is required");
    const user = await this.userRepository.getById(id);
    if (!user) throw new Error(\`\${id} is not found\`);
    return user;
  };
}
`,
          },
          {
            filePath: `/home/hiromi/git/umino/Auto-GPT-Programming-TypeScript/sample-project/src/domain/usecases/adapter-interfaces/UserRepository.ts`,
            fileContent: `// ./src/domain/usecases/adapter-interfaces/UserRepository.ts
import { User } from "../../entities/User";

export interface UserRepository {
  create(user: User): Promise<void>;
  getById(id: string): Promise<User>;
}
`,
          },
        ],
        `npm run build

> sample-project@1.0.0 build /home/hiromi/git/umino/Auto-GPT-Programming-TypeScript/sample-project
> tsc

src/domain/usecases/GetUserUseCase.test.ts:10:5 - error TS2741: Property 'create' is missing in type '{ getById: (id: string) => Promise<User>; }' but required in type 'UserRepository'.

10     userRepository = {
       ~~~~~~~~~~~~~~

  src/domain/usecases/adapter-interfaces/UserRepository.ts:5:3
    5   create(user: User): Promise<void>;
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    'create' is declared here.

src/domain/usecases/GetUserUseCase.test.ts:13:22 - error TS2693: 'User' only refers to a type, but is being used as a value here.

13           return new User("1", "John");
                        ~~~~

src/domain/usecases/GetUserUseCase.test.ts:15:11 - error TS2322: Type 'null' is not assignable to type 'User'.

15           return null;
             ~~~~~~~~~~~~


Found 3 errors in the same file, starting at: src/domain/usecases/GetUserUseCase.test.ts:10

npm ERR! code ELIFECYCLE
npm ERR! errno 2
npm ERR! sample-project@1.0.0 build: \`tsc\`
npm ERR! Exit status 2
npm ERR! 
npm ERR! Failed at the sample-project@1.0.0 build script.
npm ERR! This is probably not a problem with npm. There is likely additional logging output above.

npm ERR! A complete log of this run can be found in:
npm ERR!     /home/hiromi/.npm/_logs/2023-06-06T14_26_01_793Z-debug.log
hiromi@202303:~/git/umino/Auto-GPT-Programming-TypeScript/sample-project$ 

`
      );
      expect(result).toEqual({});
    });
  });
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
      input                                          | expected
      ${"aaa```\ntest\n```bbb```json\ntest2\n```"}   | ${["test", "test2"]}
      ${"aaa```\ntest\n```bbb```\njson\ntest2\n```"} | ${["test", "json\ntest2"]}
      ${"aaa```\ntest\n```bbb"}                      | ${["test"]}
      ${"aaa```\nte\nst\n```bbb"}                    | ${["te\nst"]}
      ${"aaa```\ntest\ntest2\n```bbb"}               | ${["test\ntest2"]}
      ${"aaa```json\ntest\n```bbb"}                  | ${["test"]}
      ${sampleResult} | ${[`{
  "filePathsToRead": [
    "/home/hiromi/git/umino/Auto-GPT-Programming-TypeScript/sample-project/src/domain/usecases/GetUserUseCase.ts"
  ],
  "unitTestContent": "import { UserRepository } from \\"./adapter-interfaces/UserRepository\\";\\nimport { User } from \\"../entities/User\\";\\nimport { GetUserUseCase } from \\"./GetUserUseCase\\";\\n\\ndescribe(\\"GetUserUseCase\\", () => {\\n  let userRepository: UserRepository;\\n  let getUserUseCase: GetUserUseCase;\\n\\n  beforeEach(() => {\\n    userRepository = {\\n      getById: jest.fn(),\\n    };\\n    getUserUseCase = new GetUserUseCase(userRepository);\\n  });\\n\\n  afterEach(() => {\\n    jest.resetAllMocks();\\n  });\\n\\n  it(\\"should throw an error if id is missing\\", async () => {\\n    await expect(getUserUseCase.execute(null)).rejects.toThrow(\\n      \\"id is required\\"\\n    );\\n  });\\n\\n  it(\\"should throw an error if user is not found\\", async () => {\\n    const id = \\"123\\";\\n    userRepository.getById.mockResolvedValueOnce(null);\\n\\n    await expect(getUserUseCase.execute(id)).rejects.toThrow(\\n      \`\${id} is not found\`\\n    );\\n  });\\n\\n  it(\\"should return user if user is found\\", async () => {\\n    const id = \\"123\\";\\n    const user = { id } as User;\\n    userRepository.getById.mockResolvedValueOnce(user);\\n\\n    const result = await getUserUseCase.execute(id);\\n\\n    expect(userRepository.getById).toHaveBeenCalledWith(id);\\n    expect(result).toEqual(user);\\n  });\\n});\\n",
  "thought": "The unit test file imports the necessary modules and describes a test suite for the GetUserUseCase. The 'beforeEach' and 'afterEach' functions are used to reset the mocks before and after each test, respectively. The 'it' function contains three test cases: one to check if the function throws an error when the id is missing, another to check if the function throws an error when the user is not found, and a third to check if the function returns the user when the user is found. The function is tested by mocking the UserRepository and calling getUserUseCase.execute() with appropriate arguments."
}`]}
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
        const patchCreator = new ChatGptPatchCreator();
        const result = patchCreator.readOnlyCodeBlock(input);
        expect(result).toEqual(expected);
      }
    );
  });
});
