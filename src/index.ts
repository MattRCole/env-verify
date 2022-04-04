import {
  UnmappedConfig,
  MappedConfig,
  VerifiedConfig,
  MissingValue,
  MappedConfigElement,
  Env,
  ResolvedValue,
} from './types'
import { InsertValue, SecretKey, TransformValue } from './classes'
import { getResolvers } from './config-resolvers'

const getMapConfigFunction = <T extends UnmappedConfig<any>>({
  config,
  env,
  path = '',
}: {
  config: T
  env: Env
  path?: string
}) => <P extends keyof T>(
  key: P
): [P, MappedConfigElement<T[P]>, MissingValue[]] => {
  const value = config[key]
  const subPath = path.length === 0 ? `${key}` : `${path}.${key}`

  const {
    resolveSecret,
    resolveInsert,
    resolveTransformer,
    resolveEnvValue,
  } = getResolvers<T, P>(env, subPath)

  if (value instanceof SecretKey) return resolveSecret(key, value)

  if (value instanceof InsertValue) return resolveInsert(key, value)

  if (value instanceof TransformValue) return resolveTransformer(key, value)

  if (typeof value === 'string') return resolveEnvValue(key, value)

  const { errors, config: subConfig } = recursiveVerify({
    config: value as UnmappedConfig<T[P]>,
    env,
    path: subPath,
  })

  return [key, subConfig, errors] as [
    P,
    MappedConfigElement<T[P]>,
    MissingValue[]
  ]
}

const getKeys = <T>(obj: T): (keyof T)[] => Object.keys(obj) as any

const recursiveVerify = <T extends UnmappedConfig<any>>(paramCollection: {
  config: T
  path?: string
  env: Env
}): { config: MappedConfig<T>; errors: MissingValue[] } => {
  type Acc = { config: MappedConfig<T>; errors: MissingValue[] }
  const reduceConf = (acc: Acc, resolvedValue: ResolvedValue<T, keyof T>) => {
    const [key, config, errors] = resolvedValue
    return {
      config: {
        ...acc.config,
        ...{ [key]: config },
      },
      errors: acc.errors.concat(errors),
    }
  }
  const mapConf = getMapConfigFunction(paramCollection)
  const mappedConf = getKeys(paramCollection.config).map(mapConf)

  return mappedConf.reduce<Acc>(reduceConf, { config: {}, errors: [] } as any)
}

export type VerifyReturnObject<T> = {
  config: MappedConfig<T>
  missingValues: MissingValue[]
  missingValueMessages: string[]
}

export function verify<T extends UnmappedConfig<any>>(
  config: T,
  env: { [key: string]: string | undefined } = process.env
): VerifyReturnObject<T> {
  const { config: builtConfig, errors } = recursiveVerify({
    config,
    env,
  })

  const missingValueMessages = errors.map(
    ({ envKey, path }) =>
      `environment value ${envKey} is missing from config object at ${path}`
  )

  return {
    config: builtConfig,
    missingValues: errors,
    missingValueMessages,
  }
}

export function strictVerify<T extends UnmappedConfig<any>>(
  config: T,
  env: { [key: string]: string | undefined } = process.env
): VerifiedConfig<T> {
  const { config: builtConfig, missingValueMessages } = verify(config, env)

  if (missingValueMessages.length > 0) {
    throw new Error(
      `Missing configuration values: ${missingValueMessages.join('\n')}`
    )
  }
  return builtConfig as VerifiedConfig<T>
}

export function insert<T>(value: T): InsertValue<T> {
  return new InsertValue(value)
}

export function secret(envKey: string) {
  return new SecretKey(envKey)
}

export function transform<T>(
  envKey: string,
  transformFunction: (envValue: string) => T
) {
  return new TransformValue<T>(envKey, transformFunction)
}

export function transformFP<T>(
  transformFunction: (envValue: string) => T,
  envKey: string
): TransformValue<T>
export function transformFP<T>(
  transformFunction: (envValue: string) => T
): (envKey: string) => TransformValue<T>
export function transformFP<T>(
  transformFunction: (envValue: string) => T,
  envKey?: string
) {
  if (envKey) return new TransformValue<T>(envKey, transformFunction)
  return (envKey_: string) => new TransformValue<T>(envKey_, transformFunction)
}

export {
  UnmappedConfig as ConfigWithEnvKeys,
  UnmappedConfig,
  MappedConfig,
  VerifiedConfig,
  MappedConfigElement,
} from './types'

export { TransformValue, InsertValue, SecretKey, Secret } from './classes'
