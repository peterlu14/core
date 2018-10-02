// @flow

import { ExecutionEnvironment, emptyFunction } from 'fbjs';

type loggerType = (...message: $ReadOnlyArray<string>) => void;

/**
 * @example
 * hideLoggerInProduction(true, () => {});
 *
 * @param {boolean} isProduction - is production
 * @param {Function} logger - logger function
 *
 * @return {Function} - logger or empty function
 */
export const hideLoggerInProduction = (
  isProduction: boolean,
  logger: loggerType,
) => (isProduction ? emptyFunction : logger);

export default (
  name: string,
  runAfterError?: () => void = emptyFunction,
): {
  error: loggerType,
  info: loggerType,
} => {
  /**
   * remove when chalk support browser
   * https://github.com/chalk/chalk/issues/300
   *
   * @example
   * chalk`{red ${test}}`;
   *
   * @param {Array} texts - texts array
   * @param {Array} keys - keys array
   *
   * @return {Array} - console.log string
   */
  const chalk = !ExecutionEnvironment.canUseEventListeners
    ? require('chalk')
    : (
        texts: $ReadOnlyArray<string>,
        ...keys: $ReadOnlyArray<string>
      ): $ReadOnlyArray<string> => {
        const colorpattern = /(\{[a-zA-Z]* )|(\})/g;
        const colorStore = [];
        const transformString = texts
          .map(
            (text: string): string => {
              colorStore.push(
                // $FlowFixMe Flow does not yet support method or property calls in optional chains.
                ...(text.match(colorpattern)?.map(
                  (color: string): string => {
                    if (/\}/.test(color)) return 'color: black';

                    return `color: ${color.replace(/\{([a-zA-Z]*) /, '$1')}`;
                  },
                ) || []),
              );

              return text.replace(colorpattern, '%c');
            },
          )
          .reduce(
            (result: string, text: string, index: number): string =>
              `${result}${text}${keys[index] || ''}`,
            '',
          );

        return [transformString, ...colorStore];
      };

  /**
   * @example
   * logger(true)
   *
   * @param {boolean} isError - show error log
   *
   * @return {Function} - logger function
   */
  const logger = (isError: boolean): loggerType => {
    const { log, error } = console;

    /**
     * simple when chalk can use in browser
     * just need to `const logFunc = isError ? error : log`
     *
     * @example
     * logFunc('test');
     *
     * @param {string | Array<string>} message - message to log
     */
    const logFunc = (message: string | $ReadOnlyArray<string>) => {
      if (ExecutionEnvironment.canUseEventListeners)
        (isError ? error : log)(...message);
      else (isError ? error : log)(message);
    };

    return (...messages: $ReadOnlyArray<string>) => {
      messages.forEach((message: string) => {
        logFunc(
          isError
            ? chalk`  {red ${name}} ${message}`
            : chalk`  {green ${name}} ${message}`,
        );
      });

      if (isError) runAfterError();
    };
  };

  return {
    error: hideLoggerInProduction(
      process.env.NODE_ENV === 'production',
      logger(true),
    ),
    info: hideLoggerInProduction(
      process.env.NODE_ENV === 'production',
      logger(false),
    ),
  };
};