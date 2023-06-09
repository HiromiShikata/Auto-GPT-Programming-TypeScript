import { fixErrorCliHandler } from './FixErrorHandler';
jest.setTimeout(10 * 60 * 1000);

describe('FixErrorHandler', () => {
  test('success', async () => {
    const fixErrorHandler = await fixErrorCliHandler(
      `Please fix this error. domain/entities must not be updated. I think logic inside other layer is wrong.`,
      '/home/hiromi/git/umino/Auto-GPT-Programming-TypeScript/sample-project',
      'npm run build && npm run test',
      'gpt-4',
    );
    expect(fixErrorHandler).toEqual(undefined);
  });
});
