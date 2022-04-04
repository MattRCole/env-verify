import { InsertValue, Secret, SecretKey, TransformValue } from './classes'
import { MissingValue, Env, MappedConfigElement, ResolvedValue } from './types'

type ResolveEnvValue = (key: string) => [string, MissingValue[]]

const resolveEnvValueCurried = (
  env: { [key: string]: string },
  subPath: string
) => (key: string): [string, MissingValue[]] => {
  const envValue = env[key]
  if (envValue === undefined || envValue.length === 0) {
    const error: MissingValue = { envKey: key, path: subPath }
    return [undefined, [error]]
  }
  return [envValue, [] as MissingValue[]]
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

const resolveSecret = <T, P extends keyof T>(
  resolveEnvValue: ResolveEnvValue,
  key: P,
  value: SecretKey
) => {
  const secretKey = value.secret
  const [secretValue, errors] = resolveEnvValue(secretKey)
  return [key, getSecretObject(secretValue), errors] as ResolvedValue<T, P>
}

const resolveInsert = <T, P extends keyof T>(
  key: P,
  value: InsertValue<unknown>
) => {
  return [key, value.value, []] as ResolvedValue<T, P>
}

const resolveEnvValueToTransformedValue = <T, P extends keyof T>(
  resolveEnvValue: ResolveEnvValue,
  configKey: P,
  envKey: string,
  transformerFn: (envValue: string) => unknown
) => {
  const [envValue, errors] = resolveEnvValue(envKey)

  const transformedValue = envValue && transformerFn(envValue)

  return [configKey, transformedValue, errors] as ResolvedValue<T, P>
}

const resolveTransformer = <T, P extends keyof T>(
  resolveEnvValue: ResolveEnvValue,
  key: P,
  value: TransformValue<unknown>
) => {
  const { envKey, transformFunction } = value

  return resolveEnvValueToTransformedValue<T, P>(
    resolveEnvValue,
    key,
    envKey,
    transformFunction
  )
}

export const getResolvers = <T, P extends keyof T>(
  env: Env,
  subPath: string
) => {
  const resolveEnvValue = resolveEnvValueCurried(env, subPath)
  return {
    resolveSecret: (key: P, value: SecretKey) =>
      resolveSecret<T, P>(resolveEnvValue, key, value),
    resolveInsert: (key: P, value: InsertValue<unknown>) =>
      resolveInsert<T, P>(key, value),
    resolveTransformer: (key: P, value: TransformValue<unknown>) =>
      resolveTransformer<T, P>(resolveEnvValue, key, value),
    resolveEnvValue: (key: P, value: string) => {
      const [envValue, errors] = resolveEnvValue(value)
      return [key, envValue, errors] as [
        P,
        MappedConfigElement<T[P]>,
        MissingValue[]
      ]
    },
  }
}
