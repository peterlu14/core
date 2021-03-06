/**
 * fixme-flow-file-annotation
 *
 * Flow not support @babel/plugin-proposal-pipeline-operator
 * https://github.com/facebook/flow/issues/5443
 */
/* eslint-disable flowtype/no-types-missing-file-annotation, flowtype/require-valid-file-annotation */

import { type Context as koaContextType } from 'koa';

import server from '../../index';

/**
 * @example
 * customMiddleware('test')
 *
 * @param {string} newBody - new body
 *
 * @return {Function} - koa middleware
 */
const customMiddleware = (newBody: string) => async (
  ctx: koaContextType,
  next: () => Promise<void>,
) => {
  ctx.body = [...(ctx.body || []), newBody];
  await next();
};

export default server.init()
  |> server.use(customMiddleware('entry router'))
  |> ('/test'
    |> server.all
    |> server.use(customMiddleware('test'))
    |> ('/get'
      |> server.get
      |> server.use(customMiddleware('get'))
      |> server.end)
    |> ('/post'
      |> server.post
      |> server.use(customMiddleware('post'))
      |> server.end)
    |> ('/put'
      |> server.put
      |> server.use(customMiddleware('put'))
      |> server.end)
    |> ('/del'
      |> server.del
      |> server.use(customMiddleware('del'))
      |> server.end)
    |> server.end)
  |> server.run();
