const env = process.env.NODE_ENV || 'development';

if(env === 'development' || env === 'test') {
  var config = require('./config.json');
  var envConfig = config[env];

  Object.keys(envConfig).forEach((k) => {
    process.env[k] = envConfig[k];
  });
}
