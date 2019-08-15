import * as R from 'ramda'

interface MappedConfig {
  [key: string]: string | undefined | MappedConfig
}
interface ConfigWithEnvKeys {
  [key: string]: string | ConfigWithEnvKeys
}

interface VerifyParamCollection {
  config: ConfigWithEnvKeys
  env: { [key: string]: string | undefined }
  errors?: Error[]
  path?: string
}

interface Options {
  env: { [key: string]: string | undefined }
  exitOnError: boolean
  logErrors: boolean
}

interface VerifiedConfig {
  [key: string]: string | VerifiedConfig
}

const recursiveVerify = ({
  config,
  env,
  errors = [] as Error[],
  path = ''
}: VerifyParamCollection): VerifyParamCollection => {
  const newConfig = R.mapObjIndexed((value, key) => {
    const subPath = path.length === 0 ? key : `${path}.${key}`

    if (typeof value === 'string') {
      const envValue = env[value]
      if (envValue === undefined) {
        errors.push(
          new Error(
            `environment value ${value} is missing from config file at ${subPath}`
          )
        )
        return envValue as undefined
      }
      return envValue as string
    } else {
      const { errors: subErrors, config: subConfig } = recursiveVerify({
        config: value,
        env,
        path: subPath
      })

      errors = errors.concat(subErrors)
      return subConfig
    }
  }, config)

  return { config: newConfig, env, errors, path }
}

export function verify(
  config: ConfigWithEnvKeys,
  options?: Partial<Options>
): { config: MappedConfig; errors: string[] } {
  const { env, exitOnError, logErrors } = {
    env: process.env,
    exitOnError: true,
    logErrors: true,
    ...options
  }
  const { config: builtConfig, errors } = recursiveVerify({ config, env })

  if (errors.length !== 0) {
    logErrors && errors.forEach((error: Error) => console.error(error.message))
    exitOnError && process.exit(1)
  }
  const errorMessages = errors.map(
    ({ message }: { message: string }) => message
  )

  return { config: builtConfig, errors: errorMessages }
}

export function strictVerify(
  config: ConfigWithEnvKeys,
  env: { [key: string]: string | undefined }
): VerifiedConfig {
  return verify(config, { env }).config as VerifiedConfig
}
