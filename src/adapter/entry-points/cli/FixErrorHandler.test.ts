import { fixErrorCliHandler } from './FixErrorHandler';
jest.setTimeout(60 * 60 * 1000);

describe('FixErrorHandler', () => {
  test('success', async () => {
    const fixErrorHandler = await fixErrorCliHandler(
      `Please fix this error. domain/entities must not be updated. I think logic inside other layer is wrong.`,
      '/home/hiromi/git/umino/Auto-GPT-Programming-TypeScript/sample-project',
      'npm run build && npm run test',
      `tree -I 'node_modules|dist|reports|*.orig|*.rej'`,
      'gpt-4',
    );
    expect(fixErrorHandler).toEqual(undefined);
  });
  test('success replace words', async () => {
    const fixErrorHandler = await fixErrorCliHandler(
      `Please make patch to fix this error correctly. Don't violate the dependency rules in Clean Architecture by your patch. Domain layer must not depends on adapter layer. 
This project strict about types. You must use type guard instead 'as' and 'any'.`,
      '/home/hiromi/git/oss/replace-all-words',
      'npm run build --loglevel warn && npm run fmt --loglevel warn && npm run test',
      `tree -I 'node_modules|dist|reports|*.orig|*.rej|bin'`,
      'gpt-4',
    );
    expect(fixErrorHandler).toEqual(undefined);
  });
  test('success graphql generator', async () => {
    const fixErrorHandler = await fixErrorCliHandler(
      `Please fix the error`,
      '/home/hiromi/git/umino/graphql-generator-from-entity-definitions',
      'npm run build --loglevel warn && npm run fmt && npm run test --loglevel warn',
      `tree -I 'node_modules|dist|reports|*.orig|*.rej|bin'`,
      'gpt-4',
    );
    expect(fixErrorHandler).toEqual(undefined);
  });
});
