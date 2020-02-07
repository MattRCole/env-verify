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

const getValueFromEnvFunction = (
  env: { [key: string]: string },
  subPath: string
) => (key: string): [string, Error?] => {
  const envValue = env[key]
  if (envValue === undefined || envValue.length === 0) {
    return [
      undefined,
      new Error(
        `environment value ${key} is missing from config object at ${subPath}`
      )
    ]
  }
  return [envValue]
}

const getMapConfigFunction = ({ config, env, path }: VerifyParamCollection) => (
  key: string
): [ConfigWithEnvKeys, Error[]] => {
  const value = config[key]
  const subPath = path.length === 0 ? key : `${path}.${key}`

  const getValueFromEnv = getValueFromEnvFunction(env, subPath)

  if (value instanceof InsertValue) {
    return [{ [key]: value.value }, []]
  }

  if (Array.isArray(value)) {
    const [envKey, transformFn] = value as TransformTuple

    const [envValue, error] = getValueFromEnv(envKey)

    const transforedValue = envValue && transformFn(envValue)

    return [{ [key]: transforedValue }, error ? [error] : []]
  }

  if (typeof value === 'string') {
    const [envValue, error] = getValueFromEnv(value as string)

    return [{ [key]: envValue }, error ? [error] : []]
  }

  const { errors, config: subConfig } = recursiveVerify({
    config: value,
    env,
    path: subPath
  })

  return [{ [key]: subConfig }, errors]
}

const reduceConf = (
  acc: { config: ConfigWithEnvKeys; errors: Error[] },
  [config, errors]: [ConfigWithEnvKeys, Error[]]
) => {
  return {
    config: {
      ...acc.config,
      ...config
    },
    errors: acc.errors.concat(errors)
  }
}

const recursiveVerify = ({
  config,
  env,
  path = ''
}: VerifyParamCollection): VerifyParamCollection => {
  const mapConf = getMapConfigFunction({ config, env, path })
  const mappedConf = Object.keys(config).map(mapConf)
  const {
    config: accumulatedConfig,
    errors: accumulatedErrors
  } = mappedConf.reduce(reduceConf, {
    config: {} as ConfigWithEnvKeys,
    errors: [] as Error[]
  })

  return { config: accumulatedConfig, env, errors: accumulatedErrors, path }
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
