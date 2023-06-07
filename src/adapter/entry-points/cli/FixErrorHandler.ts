import { FixErrorUseCase } from "../../../domain/usecases/FixErrorUseCase";
import { FsFileRepository } from "../../repositories/FsFileRepository";
import { BashTestExecutor } from "../../repositories/BashTestExecutor";
import { ChatGptUnitTestCreator } from "../../repositories/ChatGptUnitTestCreator";
import { ChatGptPatchCreator } from "../../repositories/ChatGptPatchCreator";

export const fixErrorCliHandler = async () => {
  const useCase = new FixErrorUseCase(
    new FsFileRepository(),
    new BashTestExecutor(),
    // new ChatGptPatchCreator('gpt-4' )
    new ChatGptPatchCreator("gpt-3.5-turbo")
  );

  await useCase.run(
    "I write test file but it looks wrong.",
    "/home/hiromi/git/umino/Auto-GPT-Programming-TypeScript/sample-project",
    "npm run build && npm run test"
  );
};
// fixErrorCliHandler()
//   .then(() => console.log("done"))
//   .catch((e) => console.error(e));
