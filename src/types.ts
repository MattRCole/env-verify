import { InsertValue, Secret, SecretKey, TransformValue } from './classes'

type Cast<X extends any, Y extends any> = X extends Y ? X : Y

type MappedConfigElement_<E extends any> = E extends TransformValue<infer R>
  ? R
  : E extends InsertValue<infer U>
  ? U
  : E extends SecretKey
  ? Secret
  : E extends string
  ? string | undefined
  : MappedConfig<E>

export type MappedConfigElement<E extends any> = MappedConfigElement_<
  E
> extends infer X
  ? Cast<X, any>
  : never

export type MappedConfig<T> = {
  [P in keyof T]: MappedConfigElement<T[P]>
}

export type Env = { [key: string]: string }

export type UnmappedConfigElement<T> = T extends InsertValue<infer U>
  ? InsertValue<U>
  : T extends SecretKey
  ? SecretKey
  : T extends string
  ? string
  : T extends UnmappedConfig<infer U>
  ? UnmappedConfig<U>
  : never

export type UnmappedConfig<T> = {
  [P in keyof T]: UnmappedConfigElement<T[P]>
}

export type MissingValue = {
  path: string
  envKey: string
}

export type VerifiedConfig<T> = {
  [P in keyof T]: T[P] extends SecretKey
    ? Secret
    : T[P] extends TransformValue<infer U>
    ? U
    : T[P] extends InsertValue<infer U>
    ? U
    : T[P] extends string
    ? string
    : VerifiedConfig<T[P]>
}

export type ResolvedValue<T, P extends keyof T> = [
  P,
  MappedConfigElement<T[P]>,
  MissingValue[]
]
