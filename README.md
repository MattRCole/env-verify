# env-verifier

Quickly verify that incoming variables from process.env aren't `undefined`

[GitHub](https://github.com/ps-dev/env-verifier)

NPM - Coming soon!

## Getting Started

you probably have code that looks like this in your repo:

```javascript
module.exports = {
  database: {
    name: process.env.DB_NAME
    host: process.env.DB_HOST
    password: process.env.DB_PASSWORD
  },
  baseUrl: process.env.BASE_URL
}
```

simply change that to this:

```javascript
const { config, errors } = verify({
  database: {
    name: 'DB_NAME'
    host: 'DB_HOST'
    password: 'DB_PASSWORD'
  },
  baseUrl: 'BASE_URL'
}, options /*see below*/)

logger.error(errors)
module.exports = config
```

The following options can be passed into the verify function:

```javascript
const options = {
  env: process.env, //default
  logErrors: true, //default, uses console.error to log
  exitOnError: true, //default, uses process.exit(1)
}

verify(config, options)
```

the `env` option can be replaced by any object that is non-nested and has key value pairs with `undefined` or `string` as their value type

the function returns the following:

### config

- Nested object where .env key has been replaced by the .env value (`string` or `undefined`)

### errors

- `string` `array` of messages about missing `.env` values
- should be logged if `logErrors` option is set to `false`

alterativly, the `verifyStrict` function can be used.

function signature (using typescript):

```typescript
interface Config {
  [key: string]: string | Config
}

interface Env {
  [key: string]: string | undefined
}

function strictVerify(config: Config, env: Env = process.env): Config
```

use example:

```javascript
module.exports = strictVerify({
  database: {
    name: 'DB_NAME'
    host: 'DB_HOST'
    password: 'DB_PASSWORD'
  },
  baseUrl: 'BASE_URL'
})

//if .env values are missing, strictVerify will log errors and immidiately exit
```

### Prerequisites

This package works best with projects that have centralized config files, IE: You map your `.env` variables to a `config` object in a file, and `import`/`require` that file wherever you need `.env` values.

Other than that, just install the package and get going!

one of these

```bash
npm install env-verifier
```

and one of these

```javascript
const verify = require('env-verifier').verify
```

and you're all set.

## Testing

after you've ran `npm install`, just run `npm test`

We use jest as our testing framework

## Contributing

Please read [CONTRIBUTING.md](CONSTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/your/project/tags).

## Authors

- **Snugbear** - *Initial work*

See also the list of [contributors](https://github.com/ps-dev/env-verifier/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
