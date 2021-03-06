// @flow

// $FlowFixMe jest mock
import { execa } from 'execa';

import getUser from '../getUser';

test('not set git user', async () => {
  execa.mainFunction = () => {
    throw new Error('not set git user');
  };

  await expect(getUser()).rejects.toThrow('process exit');
});
