/**
 * Flow not support @babel/proposal-export-default-from
 * https://github.com/facebook/flow/issues/1674
 */
/* eslint-disable flowtype/require-valid-file-annotation */

export handleUnhandledRejection from './handleUnhandledRejection';
export default from './logger';