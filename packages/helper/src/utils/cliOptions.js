// @flow

import commander from 'commander';
import debug from 'debug';
import chalk from 'chalk';

import { version } from '../../package.json';

import logger from 'utils/logger';

const debugLog = debug('helper:cliOptions');

export default (
  argv: $ReadOnlyArray<string>,
): {
  root: string,
  args: string,
} => {
  const program = new commander.Command('helper')
    .version(version, '-v, --version')
    .arguments('<commands>')
    .usage(chalk`{green <commands>} {gray [options]}`)
    .description(
      chalk`Example:
  helper {green 'babel -w'}
  helper {green 'babel -w'} {gray -r root}`,
    )
    .option(
      '-r, --root <root folder>',
      'the root folder of project. Default: src',
    );

  const {
    root = 'src',
    args: [args],
  } = program.parse([...argv]);

  debugLog({
    root,
    args,
  });

  if (!args)
    logger.fail(
      chalk`Should give an argument at least`,
      chalk`Use {green \`-h\`} to get the more information`,
    );

  return {
    root,
    args,
  };
};