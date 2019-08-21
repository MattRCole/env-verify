# env-verifier

Quickly verify that incoming variables from process.env aren't `undefined`

[GitHub](https://github.com/pluralsight/env-verifier)

[NPM](https://npmjs.com/package/env-verifier)

## Getting Started

You probably have code that looks like this in your repo:

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

There are two functions exposed - `verify` or `strictVerify`. Use `verify` when you whant to handle your own missing values, and `strictVerify` when you want us to throw a descriptive error. Simply change your code to something like this:

```javascript
const { config, errors } = verify({
  database: {
    name: 'DB_NAME'
    host: 'DB_HOST'
    password: 'DB_PASSWORD'
  },
  baseUrl: 'BASE_URL'
}, env)

if (errors.length) {
  logger.error(errors)
}

module.exports = config
```

You can pass in an `env` parameter as long as its an object that is non-nested and has key value pairs with `undefined` or `string` as their value type

Function signatures (using typescript):

```typescript
interface Config {
  [key: string]: string | Config
}

interface MappedConfig {
  [key: string]: string | undefined | Config
}

interface Env {
  [key: string]: string | undefined
}

function verify(config: Config, env: Env = process.env): { config: MappedConfig, errors: string[] }

function strictVerify(config: Config, env: Env = process.env): Config //Throws on .env miss
```

Use example for `strictVerify`:

```javascript
module.exports = strictVerify({
  database: {
    name: 'DB_NAME'
    host: 'DB_HOST'
    password: 'DB_PASSWORD'
  },
  baseUrl: 'BASE_URL'
})
```

### Prerequisites

This package works best with projects that have centralized config files, IE: You map your `.env` variables to a `config` object in a file, and `import`/`require` that config object wherever you need `.env` values.

Other than that, just install the package and get going!

One of these

```bash
npm install env-verifier
```

And one of these

```javascript
const { verify, strictVerify } = require('env-verifier')
```

And you're all set.

## Testing

After you've ran `npm install`, just run `npm test`

We use jest as our testing framework

## Contributing

Please read [CONTRIBUTING.md](CONSTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/pluralsight/env-verifier/tags).

## Authors

- **Snugbear** - *Initial work*

See also the list of [contributors](https://github.com/pluralsight/env-verifier/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
