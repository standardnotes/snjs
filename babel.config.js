module.exports = function (api) {
  api.cache(true);

  const presets = [
    '@babel/typescript',
    '@babel/preset-react',
    ['@babel/preset-env', {
      'targets': {
        'chrome': '58',
        'ie': '11'
      }
    }]
  ];

  const plugins = [
    ['@babel/plugin-transform-runtime', {
      'useESModules': true,
      'regenerator': true,
      'absoluteRuntime': false,
      'corejs': false,
      'helpers': false,
    }],
    '@babel/plugin-proposal-class-properties'
  ];

  return {
    presets,
    plugins
  };
};
