// @flow

import { execa } from 'execa';

import { getUser } from '../getUser';

describe('get user', () => {
  it('work', async (): Promise<void> => {
    expect(await getUser()).toEqual([
      'git config --get user.name',
      'git config --get user.email',
    ]);
  });

  it('not set git user', async (): Promise<void> => {
    execa.mainFunction = () => {
      throw new Error('not set git user');
    };

    await expect(getUser()).rejects.toThrow('process exit');
  });
});