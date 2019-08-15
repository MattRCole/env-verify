import * as R from 'ramda'

interface MappedConfig {
  [key: string]: string | undefined | MappedConfig
}
interface ConfigWithEnvKeys {
  [key: string]: string | ConfigWithEnvKeys
}

interface VerifyParamCollection {
  config: ConfigWithEnvKeys
  env: {[key: string]: (string | undefined)}
  errors: Error[]
  path: string
}

interface Options {
  env: {[key: string]: string | undefined}
  exitOnError: boolean
  logErrors: boolean
}

interface VerifiedConfig {
  [key: string]: string
}

const recursiveVerify = ({ config, env, errors, path } : VerifyParamCollection): VerifyParamCollection => {
  const newConfig = R.mapObjIndexed((value, key)=> {
    const subPath = path.length === 0 ? key : `${path}.${key}`

    if(typeof(value) === 'string') {
      const envValue = env[value]
      if(envValue === undefined) {
        errors.push(new Error(`${value} is missing from config file at ${subPath}`))
        return envValue as undefined
      }
      return envValue as string
    } else {
      const {errors: subErrors, config: subConfig} = recursiveVerify({config: value, env, errors, path: subPath})
      
      errors.concat(subErrors)
      return subConfig
    }
    
  },
  config)
  
  return { config: newConfig, env, errors, path }
}

export function verify(config: ConfigWithEnvKeys, options?: Partial<Options>): { config: MappedConfig, errors: string } {
  const {env, exitOnError, logErrors} = {env: process.env, exitOnError: true, logErrors: true, ...options}
  const {config: builtConfig, errors} = recursiveVerify({config, env, errors: ([] as Error[]), path: ''})

  if(errors.length !== 0) {
    logErrors && errors.forEach((error: Error) => console.error(error))
    exitOnError && process.exit(1)
  }
  const strigifiedErrors = errors.map(({message}: {message: string}) => message).join('\n')

  return { config: builtConfig, errors: strigifiedErrors }
}

export function strictVerify (config: ConfigWithEnvKeys, env: {[key: string]: string | undefined}) : VerifiedConfig {
  return verify(config, { env }).config as VerifiedConfig
}