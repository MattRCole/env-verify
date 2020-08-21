export type MappedConfig<T> = {
  [P in keyof T]: T[P] extends SecretKey
    ? Secret
    : T[P] extends TransformTuple<infer U>
    ? U | undefined
    : T[P] extends InsertValue<infer U>
    ? U
    : T[P] extends string
    ? string | undefined
    : MappedConfig<T[P]>
}

export type TransformTuple<T> = [string, (_: string) => T]

export type ConfigWithEnvKeys<T> = {
  [P in keyof T]: T[P] extends InsertValue<infer U>
    ? InsertValue<U>
    : T[P] extends SecretKey
    ? SecretKey
    : T[P] extends string
    ? string
    : T[P] extends TransformTuple<infer U>
    ? TransformTuple<U>
    : T[P] extends ConfigWithEnvKeys<T[P]>
    ? ConfigWithEnvKeys<T[P]>
    : never
}

interface VerifyParamCollection<T> {
  config: ConfigWithEnvKeys<T>
  env: { [key: string]: string | undefined }
  path?: string
}

export type VerifiedConfig<T> = {
  [P in keyof T]: T[P] extends SecretKey
    ? Secret
    : T[P] extends TransformTuple<infer U>
    ? U
    : T[P] extends InsertValue<infer U>
    ? U
    : T[P] extends string
    ? string
    : VerifiedConfig<T[P]>
}

export class InsertValue<T> {
  value: T
  constructor(value: T) {
    this.value = value
  }
}

class SecretKey {
  secret: string
  constructor(secret: string) {
    this.secret = secret
  }
}

export class Secret {
  toJSON() {
    return '[secret]'
  }
  reveal: { (): string }

  constructor(secret: string) {
    this.reveal = () => secret
  }
}

const isNode = () =>
  typeof process === 'object' && process + '' === '[object process]'

const getSecretObject = (secret: string) => {
  const secretObj = new Secret(secret) as any

  if (isNode()) {
    const util = require('util')
    secretObj[util.inspect.custom] = () => '[secret]'
  }

  return secretObj as Secret
}

const getEnvValueOrErrorCurried = (
  env: { [key: string]: string },
  subPath: string
) => (key: string): [string, Error[]] => {
  const envValue = env[key]
  if (envValue === undefined || envValue.length === 0) {
    const error = new Error(
      `environment value ${key} is missing from config object at ${subPath}`
    )
    return [undefined, [error]]
  }
  return [envValue, [] as Error[]]
}

const getMapConfigFunction = <T>({
  config,
  env,
  path = ''
}: VerifyParamCollection<T>) => <P extends keyof T>(key: P): [Partial<MappedConfig<T>>, Error[]] => {
  const value = config[key]
  const subPath = path.length === 0 ? key + '' : `${path}.${key}`

  const getEnvValueOrError = getEnvValueOrErrorCurried(env, subPath)

  if (value instanceof SecretKey) {
    const secretKey = value.secret
    const [secretValue, errors] = getEnvValueOrError(secretKey)
    return [
      { [key]: getSecretObject(secretValue) } as Partial<MappedConfig<T>>,
      errors
    ]
  }

  if (value instanceof InsertValue) {
    return [
      { [key]: value.value } as Partial<MappedConfig<T>>,
      []
    ]
  }

  if (Array.isArray(value)) {
    const [envKey, transformFn] = (value as any)
    const [envValue, errors] = getEnvValueOrError(envKey)

    const transforedValue = envValue && transformFn(envValue)

    return [
      { [key]: transforedValue } as Partial<MappedConfig<T>>,
      errors
    ]
  }

  if (typeof value === 'string') {
    const [envValue, errors] = getEnvValueOrError(value as string)

    return [
      { [key]: envValue } as Partial<MappedConfig<T>>,
      errors
    ]
  }

  const { errors, config: subConfig } = recursiveVerify({
    config: value as ConfigWithEnvKeys<T[P]>,
    env,
    path: subPath
  })

  return [
      { [key]: subConfig } as Partial<MappedConfig<T>>,
      errors
    ]
}

const reduceConf = <T>(
  acc: { config: Partial<MappedConfig<T>>; errors: Error[] },
  [config, errors]: [Partial<MappedConfig<T>>, Error[]]
) => {
  return {
    config: {
      ...acc.config,
      ...config
    },
    errors: acc.errors.concat(errors)
  }
}

const recursiveVerify = <T>(
  paramCollection: VerifyParamCollection<T>
): { config: MappedConfig<T>; errors: Error[] } => {
  const mapConf = getMapConfigFunction(paramCollection)
  const mappedConf: [MappedConfig<T>, Error[]] = Object.keys(paramCollection.config).map(mapConf as any) as any

  return mappedConf.reduce(reduceConf as any, { config: {}, errors: [] }) as any
}

export function verify<T>(
  config: ConfigWithEnvKeys<T>,
  env: { [key: string]: string | undefined } = process.env
): { config: MappedConfig<T>; errors: string[] } {
  const { config: builtConfig, errors } = recursiveVerify({
    config,
    env
  })

  const errorMessages = errors.map(
    ({ message }: { message: string }) => message
  )

  return { config: builtConfig, errors: errorMessages }
}

export function strictVerify<T>(
  config: ConfigWithEnvKeys<T>,
  env: { [key: string]: string | undefined } = process.env
): VerifiedConfig<T> {
  const { config: builtConfig, errors } = verify(config, env)

  if (errors.length > 0) {
    throw new Error(`Missing configuration values: ${errors.join('\n')}`)
  }
  return builtConfig as VerifiedConfig<T>
}

export function insert<T>(value: any): InsertValue<T> {
  return new InsertValue(value)
}

export function secret(envKey: string) {
  return new SecretKey(envKey)
}
