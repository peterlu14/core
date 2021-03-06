// @flow

/**
 * @example
 * correct();
 *
 * @param {string} argu - any
 * @return {'value'} - value
 */
export const correct = (argu: string) => 'value';

/**
 * @example
 * correctNotDirectReturn();
 *
 * @param {string} argu - any
 * @return {'test'} - value
 */
const correctNotDirectReturn = (argu: string): string => {
  const a = 'test';

  return a;
};

// $expectError arrow-body-style
/**
 * @example
 * shouldDirectReturn();
 *
 * @param {string} argu - any
 * @return {'value'} - value
 */
const shouldDirectReturn = (argu: string): string => {
  return 'value';
};

export default correct;
