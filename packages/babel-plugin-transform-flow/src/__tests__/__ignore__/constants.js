// @flow

import path from 'path';

export const root = path
  .resolve(__dirname, './files')
  .replace(process.cwd(), '.');

export const transformFileOptions = {
  filenames: [`${root}/index.js`],
  outFile: 'lib/index.js',
  watch: false,
  verbose: false,
};

export const transformFolderOptions = {
  filenames: [root],
  outDir: 'lib',
  watch: false,
  verbose: false,
};

export const indexFiles = ['lib/justDefinition.js.flow', 'lib/index.js.flow'];
export const hasFlowFileFiles = ['lib/hasFlowFile.js.flow'];
