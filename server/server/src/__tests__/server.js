// @flow

import testServer from './__ignore__/testServer';
import fetchServer from './__ignore__/fetchServer';

describe('default server', () => {
  test.each`
    method    | expected
    ${'get'}  | ${['entry router', 'test', 'get']}
    ${'post'} | ${['entry router', 'test', 'post']}
    ${'put'}  | ${['entry router', 'test', 'put']}
    ${'del'}  | ${''}
  `(
    '$method',
    async ({
      method,
      expected,
    }: {|
      method: string,
      expected: $ReadOnlyArray<string> | string,
    |}) => {
      expect(await fetchServer(`/test/${method}`, method)).toEqual(expected);
    },
  );

  test('not find method', async () => {
    expect(await fetchServer('/')).toEqual(['entry router']);
  });

  afterAll(() => {
    testServer.close();
  });
});
