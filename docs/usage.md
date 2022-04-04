# Usage Notes

 - [Function Parameters and Return Types](#function-parameters-and-return-types)
 - [Processing Missing Values](#processing-missing-values)
 - [Arbitrary Value Insertion](#arbitrary-value-insertion)
 - [Secret Insertion](#secret-insertion)
 - [Error Generation and Reporting](#error-generation-and-reporting)
 - [Variable Transformation](#variable-transformation)
 - [Dynamic Typings](#dynamic-typings)

## Function Parameters and Return Types

### `verify`

```typescript
export function insert<T>(value: T) => Insert<T> // see `Arbitrary Value Insertion` documentation

export function secret(envKey: string) => Secret // see `Secret Insertion` documentation

export function transform<T>(envKey: string, transformFn: (envValue: string) => T) => T // see `Variable Transformation` documentation

export function transformFP<T>(transformFn: (envValue: string) => T, envKey: string) => T
export function transformFP<T>(transformFn: (envValue: string) => T) => ((envKey: string) => T) // see `Variable Transformation` documentation

// Type given as example only, the real type is a bit more complex
export type ConfigWithEnvKeys<T> = {
  [P in keyof T]: string | ReturnType<typeof insert> | ReturnType<typeof secret> | ConfigWithEnvKeys<T[P]>
}

// Type given as example only, the real type is a bit more complex
export type MappedConfig<T> = {
  [P in keyof T]: string | null | ReturnType<typeof secret> | MappedConfig<T[P]> | any // ie: return type of `insert` or `transform` function
}

export type MissingValue = {
  path: string
  envKey: string
}

export function verify<T>(
  config: ConfigWithEnvKeys<T>
  env: { [key: string]: string | undefined } = process.env
): {
  config: MappedConfig<T>,
  missingValues: MissingValue[],
  missingValueMessages: string[],
}
```

### `strictVerify`

```typescript
export function insert<T extends any>(value: T) => Insert<T> // see `Arbitrary Value Insertion` documentation

export function secret(envKey: string) => Secret // see `Secret Insertion` documentation

// Type given as example only, the real type is a bit more complex
export type ConfigWithEnvKeys<T> = {
  [P in keyof T]: string | ReturnType<typeof insert> | ReturnType<typeof secret> | ConfigWithEnvKeys<T[P]>
}

// Type given as example only, the real type is a bit more complex
// Similar to MappedConfig<T>, but does not contain nulls (except for as returned by `transform` functions or `insert` calls)
export type VerifiedConfig<T> = {
  [P in keyof T]: string | ReturnType<typeof secret> | VerifiedConfig<T[P]> | any // ie: return type of `insert` or `transform` function
}

export function strictVerify<T>(
  config: ConfigWithEnvKeys<T>
  env: { [key: string]: string | undefined } = process.env
): VerifiedConfig<T>
```

## Processing Missing Values

An array of objects of type `MissingValue` is returned from the `verify` function.

```typescript
type MissingValue = {
  path: string
  envKey: string
}
```

### `envKey`

The key of the missing `env` value.

### `path`

The path in the `config` argument to the missing `env` variable.
Example:

```transcript
import { verify } from 'enverify'

const config = {
  db: {
    password: 'DB_PASSWORD'
  }
}

const env = {
  DB_PASSWORD: undefined
}

const result = verify(config, env)

console.log(result.missingValues)
// results in:
// [{ path: 'db.password', envKey: 'DB_PASSWORD' }]

```

## Arbitrary Value Insertion

You may have values that aren't present on your `env` object, but that you would like to live in your config object, this can be achieved by using the `insert()` function.

```javascript
const { verify, insert } = require('enverify')

module.exports = verify({
  appName: insert('my_app')
  ... // other env key names
}).config

//exports:
{
  appName: 'my_app'
  ... // other env values
}
```

## Secret Insertion

As of enverify version `1.2.0`, the obfuscation of env secrets is supported.

by wrapping the env key of the secret in the `secret` function exported by `enverify`, the secret will be retrieved and wrapped in a `Secret` object (see function specification above).

Note: support for transforming or inserting secrets is not supported at this time.

To retrieve the secret, the `reveal` function can be called.

What secret obfuscation will do:
 - protect secrets from casual logging of the produced config object
 - `JSON.stringify` of the config object will replace all secrets with the string `'[secret]'`

What secret obfuscation will not do:
- prevent the actually logging of the revealed secret
- mutate the actual string returned from the `env` object

```javascript
const { verify, secret } = require('enverify')

const env = {
  PASSWORD: 'superSecretPassword'
}

const { config } = verify({
  password: secret('PASSWORD')
  ... // other env key names
}, env)

module.exports = config

//exports:
{
  password: {
    reveal(): string
  }
  ... // other env values
}

config.password.reveal()
// returns:
'superSecretPassword'

console.log(config)
// prints: 
// {
     // if you're using nodejs:
//   password: [secret]
     // if you're using other JS environments:
//   password: Secret { reveal: [Function] }
//   ... other env values
// }

JSON.stringify(config)
// returns
// {
//   "password": "[secret]"
//   ... other env values
// }

```

## Error Generation and Reporting

Error reports are generated when an `env` variable is missing. An `env` variable is considered missing under the following circumstances:

 - `undefined` is returned from the `env` object.
 - an empty string, `''`, is returned from the `env` object. (useful for development with Docker)
 
 `verify` will always return an array of `MissingValue`s, which will be empty if there are no `env` misses.

`strictVerify` will evaluate the entire `config` object before throwing any errors in order to report all missing `env` variables

## Variable Transformation

Since `enverify` only takes environment key-value pair objects that have `strings` as the values, its sometimes necessary to transform those strings into something else (IE: transform the string `"true"` to a boolean `true`)

This can be done by calling the `transform` function which takes the `env` variable name and the transformer function.

Here is an example:

```javascript
const config = {
  buildDate: transform('BUILD_DATE', dateString => new Date(dateString)) // results in a `Date` object
  ... //other env variables
}

module.exports = verify(config)
```

### Note:

Functions passed to `transform` will not be run if its corresponding env value is missing.

A `transformFP` function is also provided that accepts the transforming function first and will return a partially applied function if an environment key string is not supplied:

```javascript
import { transformFP, verify } from 'enverify'

const parseBoolean = transformFP(trueOrFalse => trueOrFalse === 'true')

export const config = verify({
  featureFlagA: parseBoolean('FEATURE_FLAG_A'), // results in a boolean value
  featureFlabB: parseBoolean('FEATURE_FLAG_B'), // results in a boolean value
  hosts: transformFP(csvList => csvList.split(','), 'HOSTS') // results in a string array
  ... other values
})

```

## Dynamic Typings

As of `v1.4.0`, `enverify` now correctly gives type hints for the built config object.
