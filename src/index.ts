export interface MappedConfig {
  [key: string]: any | string | undefined | MappedConfig
}

export interface TransformFn {
  (envValue: string): any
}

export type TransformTuple = [string, TransformFn]

export interface ConfigWithEnvKeys {
  [key: string]: string | InsertValue | TransformTuple | ConfigWithEnvKeys
}

interface VerifyParamCollection {
  config: ConfigWithEnvKeys
  env: { [key: string]: string | undefined }
  errors?: Error[]
  path?: string
}

export interface VerifiedConfig {
  [key: string]: any | string | VerifiedConfig
}

class InsertValue {
  value: any
  constructor(value: any) {
    this.value = value
  }
}

const recursiveVerify = ({
  config,
  env,
  errors = [] as Error[],
  path = ''
}: VerifyParamCollection): VerifyParamCollection => {
  const mapConf = (key: string): ConfigWithEnvKeys => {
    const value = config[key]
    const subPath = path.length === 0 ? key : `${path}.${key}`

    const getValueFromEnv = (key: string): string => {
      const envValue = env[key]
      if (envValue === undefined || envValue.length === 0) {
        errors.push(
          new Error(
            `environment value ${key} is missing from config object at ${subPath}`
          )
        )
        return undefined
      }
      return envValue
    }

    if (value instanceof InsertValue) {
      return { [key]: value.value }
    } else if (Array.isArray(value)) {
      const [envKey, transformFn] = value as TransformTuple

      const envValue = getValueFromEnv(envKey)

      const transforedValue = envValue && transformFn(envValue)

      return { [key]: transforedValue }
    } else if (typeof value === 'string') {
      const envValue = getValueFromEnv(value as string)

      return { [key]: envValue }
    } else {
      const { errors: subErrors, config: subConfig } = recursiveVerify({
        config: value,
        env,
        path: subPath
      })

      errors = errors.concat(subErrors)
      return { [key]: subConfig }
    }
  }
  const reduceConf = (acc: ConfigWithEnvKeys, obj: ConfigWithEnvKeys) => ({
    ...acc,
    ...obj
  })
  const mappedConf = Object.keys(config).map(mapConf)
  const newConfig = mappedConf.reduce(reduceConf, {} as ConfigWithEnvKeys)

  return { config: newConfig, env, errors, path }
}

export function verify(
  config: ConfigWithEnvKeys,
  env: { [key: string]: string | undefined } = process.env
): { config: MappedConfig; errors: string[] } {
  const { config: builtConfig, errors } = recursiveVerify({ config, env })

  const errorMessages = errors.map(
    ({ message }: { message: string }) => message
  )

  return { config: builtConfig, errors: errorMessages }
}

export function strictVerify(
  config: ConfigWithEnvKeys,
  env: { [key: string]: string | undefined } = process.env
): VerifiedConfig {
  const { config: builtConfig, errors } = verify(config, env)

  if (errors.length > 0) {
    throw new Error(`Missing configuration values: ${errors.join('\n')}`)
  }
  return builtConfig as VerifiedConfig
}

export function insert(value: any): InsertValue {
  return new InsertValue(value)
}
