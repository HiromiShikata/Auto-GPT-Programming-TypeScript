import { hello } from './index';

describe('index', () => {
  test('hello', async () => {
    const res = hello('test');
    expect(res).toEqual('hello test');
  });
});
