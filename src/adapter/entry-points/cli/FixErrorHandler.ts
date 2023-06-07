import { FixErrorUseCase } from '../../../domain/usecases/FixErrorUseCase';
import { FsFileRepository } from '../../repositories/FsFileRepository';
import { ChatGptPatchCreator } from '../../repositories/ChatGptPatchCreator';
import { Configuration, OpenAIApi } from 'openai';
import { ChildProcessBashExecutor } from '../../repositories/ChildProcessBashExecutor';

export const fixErrorCliHandler = async (
  context: string,
  projectRootPath: string,
  testCommand: string,
  modelName: 'gpt-3.5-turbo' | 'gpt-4',
) => {
  const configuration = new Configuration({
    apiKey:
      modelName === 'gpt-3.5-turbo'
        ? process.env.OPENAI_API_KEY_3_5
        : process.env.OPENAI_API_KEY_4,
  });
  const openai = new OpenAIApi(configuration);
  const useCase = new FixErrorUseCase(
    new FsFileRepository(),
    new ChildProcessBashExecutor(),
    new ChatGptPatchCreator(modelName, openai),
  );

  await useCase.run(context, projectRootPath, testCommand);
};
