// @flow

import fs from 'fs';
import path from 'path';

import { type Middleware as koaMiddlewareType } from 'koa';
import compose from 'koa-compose';
import { invariant, emptyFunction } from 'fbjs';

import { handleUnhandledRejection } from '@cat-org/utils';

import getData, { type redirectType } from './utils/getData';
import deleteRequiredCache from './utils/deleteRequiredCache';
import buildJs, { type configType } from './utils/buildJs';
import getConfig from './utils/getConfig';
import server from './utils/server';

handleUnhandledRejection();

export default async ({
  dev = true,
  config: configFunc = emptyFunction.thatReturnsArgument,
  folderPath = path.resolve('./src/pages'),
  redirect = emptyFunction.thatReturnsArgument,
  basename,
}: {
  dev?: boolean,
  config?: (cnofig: {}, dev: boolean) => configType,
  folderPath?: string,
  redirect?: redirectType,
  basename?: string,
} = {}): Promise<koaMiddlewareType> => {
  if (!fs.existsSync(folderPath))
    throw new Error(
      `\`${path.relative(
        process.cwd(),
        folderPath,
      )}\` folder can not be found.`,
    );

  const data = getData(folderPath, redirect, basename);
  const config = configFunc(
    {
      config: getConfig(dev, folderPath, basename, data),
      devMiddleware: {
        stats: {
          maxModules: 0,
          colors: true,
        },
      },
      hotClient: {
        logLevel: 'warn',
      },
    },
    dev,
  );

  invariant(
    config.config.output &&
      (dev || config.config.output.path) &&
      config.config.output.publicPath,
    '`{ path, publicPath }` in `config.config.output` can not be null',
  );

  const { path: urlsPath, publicPath } = config.config.output;
  const basenamePath = basename ? `${basename.replace(/^\//, '')}/` : '';
  const urls = {
    clientUrl: `${publicPath}${basenamePath}client.js`,
    commonsUrl: `${publicPath}${basenamePath}commons.js`,
  };

  if (dev) deleteRequiredCache(folderPath);
  else {
    const chunkNames = await buildJs(config);

    ['client', 'commons'].forEach((key: string) => {
      const name = `${basenamePath}${key}`;

      if (chunkNames[name])
        urls[`${key}Url`] = `${publicPath}${chunkNames[name]}`;
    });
  }

  return compose([
    dev
      ? await require('koa-webpack')(config)
      : require('koa-mount')(publicPath, require('koa-static')(urlsPath)),
    server(basename, data, urls),
  ]);
};
