module.exports = function override(config, env) {
  var path = require('path');

  config.resolveLoader = {
    root: path.join(__dirname, 'node_modules')
  }

  // let URL loader exclude .graphql
  config.module.loaders[0].exclude.push(/\.graphql$/)

  // workaround for https://github.com/apollographql/apollo-client/issues/1237
  config.module.loaders[1].include = [
    path.resolve(__dirname, 'src'),
    path.resolve(__dirname, 'node_modules', 'apollo-client')
  ];

  // add graphql loader
  config.module.loaders.push({
    test: /\.(graphql|gql)$/,
    exclude: /node_modules/,
    loader: 'graphql-tag/loader'
  });

  console.log('loaders', config.module.loaders);

  return config;
}
