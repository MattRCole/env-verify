const R = require('ramda')

const input = {
  thing: 'THING',
  other: {
    things: 'OTHER_THINGS'
  }
}

const getEnvVal = grandaddy => {
  const { env, config, errors, path } = grandaddy
  R.lensPath(path.split('.'), config)
}

const verify = (grandaddy) => {
  const {config, env, errors, path} = grandaddy

  const newConfig = R.mapObjIndexed((value, key)=> {
    const subPath = path.length === 0 ? key : `${path}.${key}`

    if(typeof(value) === 'string') {
      const envValue = env[value]
      if(envValue === undefined) {
        errors.add(new Error(`${value} is missing from ${subPath}`))
      }
      config[key] = envValue
    } else {
      const returned = verify({config: value, env, errors, path: subPath})
      
      config[key] = returned.config
      errors.merge(returned.errors)
    }
  },
  config)
  
  return { config: newConfig, env, errors, path }
}

module.exports = function createPipeline(config, { env }) {
  const getEnvValue = (value) => {
    return env[value]
  }
  
  const recursePipeline = (value) => {
    return pipeline(value)
  }

  const pipeline = R.compose(
    R.mapObjIndexed(R.ifElse(
      R.is(String),
      getEnvValue,
      recursePipeline
    ))
  )
  return pipeline(config)
}