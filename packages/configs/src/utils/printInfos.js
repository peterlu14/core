// @flow

import chalk from 'chalk';

export default (infos: $ReadOnlyArray<string>, isError: boolean) => {
  infos.forEach((info: string) => {
    // eslint-disable-next-line no-console
    console.log(
      isError
        ? chalk`  {red configs-scripts} ${info}`
        : chalk`  {green configs-scripts} ${info}`,
    );
  });

  if (isError) {
    // eslint-disable-next-line no-console
    console.log();

    /* istanbul ignore if */
    if (process.env.NODE_ENV !== 'test') process.exit(1);
    else throw new Error('process exit');
  }
};