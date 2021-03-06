// @flow

import fs from 'fs';
import path from 'path';

import execa from 'execa';
import debug from 'debug';
import { emptyFunction } from 'fbjs';

import logger from './logger';

type ctxType = {|
  rootPath: string,
  pkg: {
    [string]: string,
    engines?: {|
      [string]: string,
    |},
  },
|};

type badgeType = {
  [string]: string,
  filterFunc?: boolean => boolean,
};

type repoType = {|
  username: string,
  projectName: string,
|};

const debugLog = debug('badges:badges');
const START_COMMENT = '<!-- badges.start -->';
const END_COMMENT = '<!-- badges.end -->';

/**
 * @example
 * getRepo()
 *
 * @return {Object} - user name and project name
 */
const getRepo = async (): Promise<?repoType> => {
  try {
    const [username, projectName] = (await execa
      .shell('git remote -v')
      .then(({ stdout }: { stdout: string }) => stdout))
      .replace(/origin\t.*@.*:(.*).git \(fetch\)(.|\n)*/, '$1')
      .split('/');

    debugLog({
      username,
      projectName,
    });

    return {
      username,
      projectName,
    };
  } catch (e) {
    debugLog(e);
    return null;
  }
};

/**
 * @example
 * getBadges(ctx, repo)
 *
 * @param {Object} ctx - context
 * @param {Object} repo - repo data
 *
 * @return {string} - badges string
 */
const getBadges = (
  { rootPath, pkg: { name, homepage, engines = {} } }: ctxType,
  { username, projectName }: repoType,
): string => {
  const badges = [
    {
      filePath: './.circleci/config.yml',
      badgeName: 'circleci',
      image: `https://img.shields.io/circleci/project/github/${username}/${projectName}/master.svg`,
      link: `https://circleci.com/gh/${username}/${projectName}`,
    },
    {
      filePath: './.npmignore',
      badgeName: 'npm',
      image: `https://img.shields.io/npm/v/${name}.svg`,
      link: `https://www.npmjs.com/package/${name}`,
    },
    {
      filePath: './.npmignore',
      badgeName: 'npm-size',
      image: `https://img.shields.io/bundlephobia/minzip/${name}.svg`,
    },
    {
      filePath: './.npmignore',
      badgeName: 'github-size',
      image: `https://img.shields.io/github/repo-size/${username}/${projectName}.svg`,
      filterFunc: (result: boolean) => !result,
    },
    ...Object.keys(engines).map((key: string) => ({
      filePath: './package.json',
      badgeName: `engine-${key}`,
      image: `https://img.shields.io/badge/${key}-${encodeURI(
        engines[key],
      )}-green.svg`,
      filterFunc: emptyFunction.thatReturnsTrue,
    })),
    {
      filePath: './LICENSE',
      badgeName: 'license',
      image: `https://img.shields.io/github/license/${username}/${projectName}.svg`,
      link: `./LICENSE`,
    },
    {
      filePath: './node_modules/.bin/lerna',
      badgeName: 'lerna',
      image: 'https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg',
      link: 'https://lernajs.io',
    },
  ].filter(
    ({ filePath, filterFunc = emptyFunction.thatReturnsArgument }: badgeType) =>
      filterFunc(fs.existsSync(path.resolve(rootPath, filePath))),
  );

  return `${badges
    .map(({ badgeName, link }: badgeType) =>
      !link
        ? `![${badgeName}][${badgeName}-image]`
        : `[![${badgeName}][${badgeName}-image]][${badgeName}-link]`,
    )
    .join(' ')}

${badges
  .map(
    ({ badgeName, image, link }: badgeType) =>
      `[${badgeName}-image]: ${image}${
        !link ? '' : `\n[${badgeName}-link]: ${link}`
      }`,
  )
  .join('\n')}

`;
};

export default async (readme: string, ctx: ctxType): Promise<?string> => {
  const repo = await getRepo();

  if (!repo) throw logger.fail('Can not find git remote');
  else
    return readme.replace(
      new RegExp(`${START_COMMENT}(.|\n)*${END_COMMENT}`, 'g'),
      `${START_COMMENT}${getBadges(ctx, repo)}${END_COMMENT}`,
    );
};
