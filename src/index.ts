#!/usr/bin/env node
//./src/index.ts
import { Command } from 'commander';
import { fixErrorCliHandler } from './adapter/entry-points/cli/FixErrorHandler';

const program = new Command();
program
  .name('Auto-GPT Programming TypeScript')
  .option(
    '--context <context>',
    'The context information related to the error you want to fix. This could be the error message, surrounding code or any other information that helps to understand the issue.',
  )
  .option(
    '--project-root-path <projectRootPath>',
    'The root path of your project. This is where your main project files are located. By default, it is set to the current directory (`./`).',
  )
  .option(
    '--test-command <testCommand>',
    'The command that you typically run to test your code. For instance, you might first build your project, format the code, and then run tests (`npm run build && npm run fmt && npm run test`).',
  )
  .option(
    `--command-to-see-project-structure <commandToSeeProjectStructure>`,
    "The command used to visualize the structure of your project. For instance, you might use the `tree` command while excluding certain directories or files (`tree -I 'node_modules|dist|reports|*.orig|*.rej'`).",
  )
  .option(
    `--modelName <modelName>`,
    'The name of the GPT model to be used for generating the patch. It can be either `gpt-3.5-turbo` or `gpt-4`.',
  )
  .description(
    'This program is designed to assist you with debugging your TypeScript projects. It leverages the power of OpenAI GPT models to suggest fixes to the errors in your code. Provide the necessary context and project details, and it will generate a patch to fix the error.',
  )
  .action(
    async ({
      context,
      projectRootPath,
      testCommand,
      commandToSeeProjectStructure,
      modelName,
    }: {
      context: string;
      projectRootPath: string;
      testCommand: string;
      commandToSeeProjectStructure: string;
      modelName: 'gpt-3.5-turbo' | 'gpt-4';
    }) => {
      await fixErrorCliHandler(
        context,
        projectRootPath,
        testCommand,
        commandToSeeProjectStructure,
        modelName,
      );
    },
  );
program.parse(process.argv);
