# env-verifier

Quickly verify that incoming variables from process.env aren't `undefined`

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
module.exports = verify({
  database: {
    name: 'DB_NAME'
    host: 'DB_HOST'
    password: 'DB_PASSWORD'
  },
  baseUrl: 'BASE_URL'
}).config
```

The following options can be passed into the verify function:

```javascript
const options = {
  env: process.env, //default
  logErrors: true, //default, uses console.error
  exitOnError: true, //default, uses process.exit(1)
}

verify(config, options)
```

the `env` option can be replaced by any object that is non-nested and has key value pairs with undefined or string as the value type

the function returns the following:

```
{
  config: //your mapped config object
  errors: //string array of descriptive error messages for any missing .env values
}
```

alterativly, the `verifyStrict` function can be used. It uses all default options and simply returns your `config` option without the `errors` object.

### Prerequisites

This package works best with projects that have centralized config files.

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

## Contributing

Please read [CONTRIBUTING.md](https://gist.github.com/PurpleBooth/b24679402957c63ec426) for details on our code of conduct, and the process for submitting pull requests to us.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/your/project/tags). 

## Authors

* **Snugbear** - *Initial work*

See also the list of [contributors](https://github.com/ps-dev/env-verifier/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
