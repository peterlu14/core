// @flow

import memoizeOne from 'memoize-one';

import pkg from './pkg';
import Store from './index';

const template = `// @flow

import React from 'react';

const Home = () => <div>@cat-org/create-project</div>;

export default Home;`;

/** react store */
class React extends Store {
  +subStores = [pkg];

  storeUseReact = false;

  /**
   * @example
   * react.checkReact()
   */
  +checkReact = memoizeOne(
    async (
      useServer: $PropertyType<$PropertyType<Store, 'ctx'>, 'useServer'>,
    ) => {
      if (useServer)
        this.storeUseReact = (await this.prompt({
          name: 'useReact',
          message: 'use react or not',
          type: 'confirm',
          default: false,
        })).useReact;
      else this.storeUseReact = false;

      this.debug(this.storeUseReact);
    },
  );

  /**
   * @example
   * react.store(ctx)
   *
   * @param {Object} ctx - store context
   */
  +start = async (ctx: $PropertyType<Store, 'ctx'>) => {
    const { useServer } = ctx;

    await this.checkReact(useServer);

    ctx.useReact = this.storeUseReact;
  };

  /**
   * @example
   * pkg.end(ctx)
   */
  +end = async () => {
    if (!this.storeUseReact) return;

    await this.writeFiles({
      'src/pages/index.js': template,
    });
    await this.execa('@cat-org/react-middleware');
  };
}

export default new React();
