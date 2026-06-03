module.exports = function (api) {
  // Differentiate config between the app (metro) and tests (jest, NODE_ENV=test).
  const isTest = api.env('test');
  api.cache.using(() => process.env.NODE_ENV);

  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      // NativeWind's babel preset pulls in react-native-css-interop, which
      // expects react-native-worklets (newer RN). It isn't needed to run the
      // pure-logic unit tests, so skip it under jest.
      ...(isTest ? [] : ['nativewind/babel']),
    ],
    plugins: [
      // react-native-reanimated/plugin MUST be listed last. Not needed in tests.
      ...(isTest ? [] : ['react-native-reanimated/plugin']),
    ],
  };
};
