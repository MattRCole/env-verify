import * as R from 'ramda'

interface ConfigObject {
  [key: string]: string | ConfigObject
}

interface MappedConfig {
  [key: string]: string | undefined | MappedConfig | Error
}

interface Options {
  env: { [key: string]: string | undefined }
  exitOnError: boolean
}

const mapConfig = (config: ConfigObject, env: { [key: string]: string | undefined }, exitOnError : boolean): MappedConfig => {
  const toReturn = Object.keys(config).reduce((mappedConfig: MappedConfig, key: string ): MappedConfig => {
    const envKey = config[key]
    
    if(typeof envKey === 'string') {
      const mappedValue = env[envKey as string]
      if(mappedValue === undefined && exitOnError) {
        mappedConfig[key] = new Error(`${envKey} is a required environment variable, but it is missing.`)
      }
      else {
        mappedConfig[key] = mappedValue
      }
    }
    else {
      mappedConfig[key] = mapConfig(envKey as ConfigObject, env, exitOnError)
    }
    return mappedConfig
  }, {})
  
  return toReturn
}

// const flattenObj = obj => {
//   const flattenLevel = childObj => R.chain(([key, value]) => {
//     if (R.type(value) === 'Object' || R.type(value) === 'Array') {
//       return R.map(([childKey, childValue]) => [`${key}.${childKey}`, childValue], flattenLevel(value))
//     } else {
//       return [[key, value]]
//     }
//   }, R.toPairs(childObj))
//   return R.fromPairs(flattenLevel(obj))
// }

// interface PartialFlatArray {
//   [[key: string] : string | undefined]
// }

interface PartiallyFlattenedArray extends Array<string | undefined | MappedConfig | PartiallyFlattenedArray>{}
//interface FlattenedArray extends Array<string | undefined>{}

const flattenObj = (obj: MappedConfig): {[key: string] : string | undefined} => {
  const flattenLevel = (childObj : any): any => R.chain(([key, value]: [string, PartiallyFlattenedArray]): PartiallyFlattenedArray[] => {
    
    if (R.type(value) === 'Object' || R.type(value) === 'Array') {
      return R.map(([childKey, childValue]: [any, any]) => [`${key}.${childKey}`, childValue], flattenLevel(value))
    } else {
      return [[key, value]]
    }
  },  R.toPairs(childObj))
  return R.fromPairs(flattenLevel(obj))
}

const getErrors = (mappedConfig: MappedConfig, exitOnError: boolean): string => {

  if (exitOnError) {
    return Object.values(
      flattenObj(mappedConfig))
        .filter((value: Error | string): boolean => (typeof(value) !== 'string'))
        .map((error:Error | string ): string => (error as Error).message)
        .join('\n')
  }

  return Object.entries(
    flattenObj(mappedConfig))
      .filter((entry: [string, string | undefined]): boolean => (typeof(entry[1]) !== 'string'))
      .map((entry: [string, undefined]): string => {
        return `Missing value for ${entry[0]}`
      })
      .join('\n')
}

// function validateConfig(config) {
//   const errors = R.compose(
//     R.reduce((acc, { message }) => `${acc}\n${message}`, ''),
//     R.filter(value => R.type(value) === 'Error'),
//     R.values,
//     flattenObj
//   )(config)
    
//   if (!R.isEmpty(errors)) {
//     console.error(errors)
//     process.exit(1)
//   }


function verifier(config: ConfigObject, options: Partial<Options>): any {
  const { env, exitOnError }: Options = { env: process.env, exitOnError: true, ...options }
  const builtConfig = mapConfig(config, env, exitOnError)
  const errors: string = getErrors(builtConfig, exitOnError)
  
  if (errors.length !== 0) {
    console.error(errors)
    if (exitOnError) {
      process.exit(1)
    }
  }
  
  return {config: builtConfig, errors}
}

export default verifier


//