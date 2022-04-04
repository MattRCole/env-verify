// Note: All examples work with both verify and strictVerify

const { verify, strictVerify } = require('enverify')
// Example of loading custom environment variables into process.env
require('dotenv').configure()

const withDotenv = verify({
  foo: 'BAR'
})

// Example with async variable storage (IE: Vault)
// Note: only flat objects are supported right now
// const myEnv = { ENV_KEY: 'value' } -- this works
// const myEnv = { DB: { PASSWORD: password } } -- this does not
var someVaultGetter

const getConfig = async () => {
  const env = await someVaultGetter.getConfig()
  return verify({
    foo: 'BAR'
  }, env)
}

// example of mixing two envs together
const myCustomEnv = { foo: 'bar', baz: 'bingo' }

const mixedEnvConfig = strictVerify({ foo: 'foo', fromProcessEnv: 'SOME_ENV_VAR' }, { ...process.env, ...myCustomEnv })
