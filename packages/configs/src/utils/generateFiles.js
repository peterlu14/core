// @flow

import path from 'path';

import chalk from 'chalk';
import debug from 'debug';
import moment from 'moment';
import outputFileSync from 'output-file-sync';

import logger from './logger';
import configs from './configs';
import worker from './worker';

const debugLog = debug('configs:generateFiles');

const CONFIG_FILES = {
  babel: 'babel.config.js',
  eslint: '.eslintrc.js',
  esw: '.eslintrc.js',
  prettier: '.prettierrc.js',
  'lint-staged': '.lintstagedrc.js',
  jest: 'jest.config.js',
};

const CONFIG_IGNORE = {
  eslint: '.eslintignore',
  esw: '.eslintignore',
  prettier: '.prettierignore',
};

/**
 * @example
 * findConfigFiles('cliName')
 *
 * @param {string} cliName - cli name
 *
 * @return {Object} - configFiles
 */
const findConfigFiles = (cliName: string): {} => {
  const { alias: cli = cliName, configFiles = {} } = configs.store[cliName];

  if (!configFiles[cliName]) {
    if (!CONFIG_FILES[cli])
      throw logger.fail(
        'Can not generate the config file',
        chalk`Add the path of the config in {cyan \`configs.${cliName}.configFiles.${cli}\`}`,
      );

    configFiles[cliName] = path.resolve(configs.rootDir, CONFIG_FILES[cli]);
  }

  return (Object.keys(configFiles): $ReadOnlyArray<string>).reduce(
    (result: {}, configCliName: string): {} => {
      const configPath = configFiles[configCliName];

      if (!configPath) return result;

      if (typeof configPath === 'string')
        return {
          ...result,
          [configCliName]: configPath,
        };

      return {
        ...result,
        ...findConfigFiles(configCliName),
      };
    },
    {},
  );
};

export default (cliName: string) => {
  const configFiles = findConfigFiles(cliName);
  const cache = {
    pid: process.pid,
    using: moment().format(),
  };

  debugLog(`Config files: ${JSON.stringify(configFiles, null, 2)}`);

  Object.keys(configFiles).forEach((configCliName: string) => {
    const {
      alias: configCli = configCliName,
      ignoreName = CONFIG_IGNORE[configCli],
      ignore: getIgnore,
    } = configs.store[configCliName];
    const configPath = configFiles[configCliName];
    const ignore = getIgnore?.() || [];

    debugLog(`Generate config: ${configPath}`);
    outputFileSync(
      configPath,
      `/* eslint-disable */ module.exports = require('@cat-org/configs')('${configCliName}', __filename);`,
    );
    worker.writeCache({
      ...cache,
      filePath: configPath,
    });

    if (ignoreName && ignore.length !== 0) {
      const ignorePath = path.resolve(path.dirname(configPath), ignoreName);

      debugLog(`Generate ignore: ${ignoreName}`);
      outputFileSync(ignorePath, ignore.join('\n'));
      worker.writeCache({
        ...cache,
        filePath: ignorePath,
      });
    }
  });
};
