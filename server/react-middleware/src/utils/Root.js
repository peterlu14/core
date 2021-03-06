// @flow

import React, { type ComponentType, type Node as NodeType } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { matchRoutes } from 'react-router-config';
import {
  Route,
  type ContextRouter as contextRouterType,
} from 'react-router-dom';
import { type Context as koaContextType } from 'koa';
import { ExecutionEnvironment } from 'fbjs';

import { type errorPropsType } from '../types';
import { lazy, Suspense, type lazyComponentType } from '../ReactIsomorphic';

export type propsType = {|
  Main: ComponentType<*>,
  Loading: ComponentType<{||}>,
  Error: ComponentType<errorPropsType>,
  routesData: $ReadOnlyArray<{|
    exact: true,
    path: $ReadOnlyArray<string>,
    component: {|
      loader: lazyComponentType,
      chunkName: string,
    |},
  |}>,
  mainInitialProps: {},
|};

type stateType = {|
  error: ?$PropertyType<errorPropsType, 'error'>,
  errorInfo: ?$PropertyType<errorPropsType, 'errorInfo'>,
|};

type storeType = {
  originalUrl: string,
  chunkName: string,
  initialProps: {|
    head?: NodeType,
  |},
  Page: $Call<typeof lazy, lazyComponentType, string>,
  lazyPage: lazyComponentType,
};

const store: storeType = {};

/**
 * @example
 * getPage(routsData, ctx)
 *
 * @param {Array} routesData - routes data
 * @param {Object} Context - getInitialProps context
 *
 * @return {Component} - page component
 */
const getPage = (
  routesData: $PropertyType<propsType, 'routesData'>,
  {
    location: { pathname, search },
    staticContext,
  }: {
    location: { pathname: string, search: string },
    staticContext?: koaContextType,
  },
): $PropertyType<storeType, 'Page'> => {
  const ctx = {
    ctx: staticContext || {
      path: pathname,
      querystring: search.replace(/\?/, ''),
      originalUrl: `${pathname}${search}`,
      origin: window.location.origin,
      href: window.location.href,
      host: window.location.host,
      hostname: window.location.hostname,
      protocol: window.location.protocol,
    },
    isServer: !ExecutionEnvironment.canUseEventListeners,
  };

  if (store.originalUrl !== ctx.ctx.originalUrl) {
    const [
      {
        route: {
          component: { loader, chunkName },
        },
      },
    ] = matchRoutes(routesData, ctx.ctx.path);

    /**
     * @example
     * lazyPage()
     *
     * @return {Object} - return Page
     */
    const lazyPage = async (): $Call<lazyComponentType> => {
      const { default: Component } = await loader();
      const { head, ...initialProps } =
        // $FlowFixMe Flow does not yet support method or property calls in optional chains.
        (await Component.getInitialProps?.(ctx)) || {};
      // TODO component should be ignored
      // eslint-disable-next-line require-jsdoc, flowtype/require-return-type
      const Page = () => <Component {...initialProps} />;

      renderToStaticMarkup(head || null);
      store.originalUrl = ctx.ctx.originalUrl;
      store.chunkName = chunkName;
      store.initialProps = {
        ...initialProps,
        head: ctx.isServer ? null : head,
      };

      return { default: Page };
    };

    store.Page = lazy(lazyPage, chunkName);
    store.lazyPage = lazyPage;
  }

  return store.Page;
};

// TODO component should be ignored
/* eslint-disable require-jsdoc */
export default class Root extends React.PureComponent<propsType, stateType> {
  static preload = (prevStore?: storeType = store): storeType => {
    Object.keys(prevStore).forEach((key: string) => {
      store[key] = prevStore[key];
    });

    return store;
  };

  static getPage = getPage;

  state = {
    error: null,
    errorInfo: null,
  };

  componentDidCatch(
    error: $PropertyType<stateType, 'error'>,
    errorInfo: $PropertyType<stateType, 'errorInfo'>,
  ) {
    this.setState({ error, errorInfo });
  }

  render(): NodeType {
    const { Main, Loading, Error, routesData, mainInitialProps } = this.props;
    const { error, errorInfo } = this.state;

    if (error && errorInfo)
      return <Error error={error} errorInfo={errorInfo} />;

    return (
      <Main {...mainInitialProps}>
        <Suspense fallback={<Loading />}>
          <Route
            children={({
              location: { pathname, search },
              staticContext,
            }: contextRouterType) =>
              React.createElement(
                // $FlowFixMe can not overwrite context type
                getPage(routesData, {
                  location: { pathname, search },
                  staticContext,
                }),
              )
            }
          />
        </Suspense>
      </Main>
    );
  }
}
/* eslint-enable require-jsdoc, flowtype/require-return-type */
