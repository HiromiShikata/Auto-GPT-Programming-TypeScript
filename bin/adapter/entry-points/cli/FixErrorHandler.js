"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fixErrorCliHandler = void 0;
const FixErrorUseCase_1 = require("../../../domain/usecases/FixErrorUseCase");
const FsFileRepository_1 = require("../../repositories/FsFileRepository");
const ChatGptPatchCreator_1 = require("../../repositories/ChatGptPatchCreator");
const openai_1 = require("openai");
const ChildProcessBashExecutor_1 = require("../../repositories/ChildProcessBashExecutor");
const SystemDateTimeRepository_1 = require("../../repositories/SystemDateTimeRepository");
const fixErrorCliHandler = async (context, projectRootPath, testCommand, commandToSeeProjectStructure, modelName) => {
    const configuration = new openai_1.Configuration({
        apiKey: modelName === 'gpt-3.5-turbo'
            ? process.env.OPENAI_API_KEY_3_5
            : process.env.OPENAI_API_KEY_4,
    });
    const openai = new openai_1.OpenAIApi(configuration);
    const useCase = new FixErrorUseCase_1.FixErrorUseCase(new FsFileRepository_1.FsFileRepository(), new ChildProcessBashExecutor_1.ChildProcessBashExecutor(), new ChatGptPatchCreator_1.ChatGptPatchCreator(modelName, openai), new SystemDateTimeRepository_1.SystemDateTimeRepository());
    await useCase.run(context, projectRootPath, testCommand, commandToSeeProjectStructure);
};
exports.fixErrorCliHandler = fixErrorCliHandler;
//# sourceMappingURL=FixErrorHandler.js.map