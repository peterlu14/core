// @flow
/* eslint-disable require-jsdoc */
// TODO component should be ignored

import React, { type Node as NodeType } from 'react';
import { Helmet } from 'react-helmet';

import { type ctxType } from '../types';

import * as styles from './styles/notFound';

export default class NotFound extends React.PureComponent<*> {
  static getInitialProps = ({
    ctx,
  }: ctxType<{| status: number |}>): {|
    head: NodeType,
  |} => {
    ctx.status = 404;

    return {
      head: (
        <Helmet>
          <title>404 | Page not found</title>
        </Helmet>
      ),
    };
  };

  render(): NodeType {
    return (
      <div style={styles.root}>
        <h1 style={styles.h1}>404</h1>

        <h2 style={styles.h2}>Page not found</h2>
      </div>
    );
  }
}
