const { transform, transformFP, strictVerify } = require('enverify')

// Since several booleans are parsed, why not save some time
// and use transformFP?
const parseBoolean = transformFP(envString => envString === 'true')

const unmappedConfig = {
  featureFlags: {
    featureA: parseBoolean('FEATURE_FLAG_A'),
    featureB: parseBoolean('FEATURE_FLAG_B'),
    featureC: parseBoolean('FEATURE_FLAG_C')
  },
  messagePublisher: {
    hosts: transform('MESSAGE_PUBLISHER_HOSTS', csvValue => csvValue.split(',')),
  }
}

// custom env used here, but not needed
const env = {
  FEATURE_FLAG_A: 'false',
  FEATURE_FLAG_B: 'true',
  FEATURE_FLAG_C: 'false',
  MESSAGE_PUBLISHER_HOSTS: 'localhost,127.0.0.1,8.8.8.8'
}

const config = strictVerify(unmappedConfig, env)
// results in:
// {
//  featureFlags: {
//    featureA: false,
//    featureB: true,
//    featureC: false,
//    messagePublisher: {
//      hosts: ['localhost', '127.0.0.1', '8.8.8.8']
//    }
//  }
// }
