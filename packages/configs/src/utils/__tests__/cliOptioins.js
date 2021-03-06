// @flow

import { npmWhich } from 'npm-which';
import { emptyFunction } from 'fbjs';

import cliOptions from '../cliOptions';
import configs from '../configs';

const defaultArgv = ['node', 'configs'];
const babelCli = npmWhich.main().sync('babel');

describe('cli options', () => {
  beforeAll(() => {
    configs.store['funcConfigInfo'] = emptyFunction.thatReturnsArgument;
    configs.store['install-package'] = {
      install: emptyFunction.thatReturnsArgument,
    };

    configs.store['run-cmd'] = {
      alias: 'babel',
      run: emptyFunction.thatReturnsArgument,
    };

    configs.store['not-found-command'] = {};
    configs.store['run-error'] = {
      alias: 'babel',
      run: () => {
        throw new Error('run error');
      },
    };
  });

  test.each`
    argv
    ${['--info']}
    ${['funcConfigInfo', '--info']}
    ${['babel:lerna', '--info']}
    ${[]}
    ${['notFindCliName']}
  `('Run $argv', ({ argv }: {| argv: $ReadOnlyArray<string> |}) => {
    expect(() => {
      cliOptions([...defaultArgv, ...argv]);
    }).toThrow('process exit');
  });

  test.each`
    cliName              | options          | cli          | argv
    ${'install-package'} | ${['--install']} | ${'install'} | ${['yarn', 'add', '--dev']}
    ${'run-cmd'}         | ${[]}            | ${babelCli}  | ${defaultArgv}
  `(
    'Run $cliName successfully with $options',
    ({
      cliName,
      options,
      cli,
      argv,
    }: {|
      cliName: string,
      options: $ReadOnlyArray<string>,
      cli: string,
      argv: $ReadOnlyArray<string>,
    |}) => {
      expect(cliOptions([...defaultArgv, cliName, ...options])).toEqual({
        cli,
        argv,
        env: {},
        cliName,
      });
    },
  );

  test.each`
    cliName                | expected
    ${'not-found-command'} | ${'process exit'}
    ${'run-error'}         | ${'run error'}
  `(
    'Run fail with $cliName',
    ({ cliName, expected }: {| cliName: string, expected: string |}) => {
      npmWhich.throwError = true;

      expect(() => {
        cliOptions([...defaultArgv, cliName]);
      }).toThrow(expected);

      npmWhich.throwError = false;
    },
  );
});
