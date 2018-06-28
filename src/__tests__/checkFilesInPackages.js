// @flow

import path from 'path';

import d3DirTree from '../../packages/utils/lib/d3DirTree';
// eslint-disable-next-line max-len
import type { d3DirTreeType } from '../../packages/utils/lib/definitions/d3DirTree.js.flow';

const packageRoot = path.resolve(__dirname, './../../packages');
const packages = d3DirTree(packageRoot);

describe('check files in packages', () => {
  packages.children.forEach(({ data, children }: d3DirTreeType) => {
    const { name } = data;

    describe(name, () => {
      const files = children
        .map(({ data: childData }: d3DirTreeType): string => childData.name)
        .filter((fileName: string): boolean => fileName !== 'node_modules')
        .sort();

      it('files in package root', () => {
        expect(files).toEqual(['.npmignore', 'lib', 'package.json', 'src']);
      });

      switch (name) {
        case 'eslint-config-cat':
          it('check eslint version', () => {
            const rootPkg = require('../../package.json');
            const pkg = require(path.resolve(
              packageRoot,
              './eslint-config-cat/package.json',
            ));

            expect(rootPkg.devDependencies.eslint).toBe(
              pkg.devDependencies.eslint,
            );
          });
          break;
        default:
          break;
      }
    });
  });
});