// @flow

import path from 'path';

import { transformFileSync } from '@babel/core';

import babelPluginTransformFlow from '../../index';

export default (filename?: string = 'index.js') =>
  transformFileSync(path.resolve(__dirname, './files', filename), {
    babelrc: false,
    presets: ['@babel/preset-env', '@babel/preset-flow'],
    plugins: [babelPluginTransformFlow],
  });
