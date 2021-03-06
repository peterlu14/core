// @flow

import path from 'path';

import commander from 'commander';
import chalk from 'chalk';
import debug from 'debug';

import { version } from '../../package.json';

import logger from './logger';
import type StoresType from 'stores';

const debugLog = debug('create-project:cliOptions');

export default (
  argv: $ReadOnlyArray<string>,
): $PropertyType<StoresType, 'ctx'> => {
  const program = new commander.Command('create-project')
    .version(version, '-v, --version')
    .arguments('<project directory>')
    .usage(chalk`{green <project directory>}`)
    .description(
      chalk`Example:
  create-project {green <project directory>}`,
    )
    .option('--skip-command', 'skip running commands');

  const {
    args: [projectDir],
    skipCommand = false,
  } = program.parse([...argv]);

  if (!projectDir)
    throw logger.fail(chalk`{red \`project directory\`} is required.`);

  const cliOptions = {
    projectDir: path.resolve(projectDir),
    skipCommand,
  };

  debugLog(cliOptions);

  return cliOptions;
};
