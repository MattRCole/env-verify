# enverify

Forked from [the original](https://github.com/pluralsight/env-verifier). Why? As the soul author and maintainer of the project, I felt it was appropriate to fork the repository and continue working on this package under my own namespace so that it could be updated periodically.

Why the name change? The name `enverify` was first proposed to me when I originally released the package, and, while I loved the name, I opted for a more professional name at the time. Now, a new name is needed for the package to be published to NPM, therefore, `enverify` was chosen.


-----


Verify that your environment variables exist, and build up your config object at the same time!

![Build](https://github.com/mattrcole/enverify/actions/workflows/test-and-release.yml/badge.svg?branch=master)

[GitHub](https://github.com/mattrcole/enverify)

[NPM](https://npmjs.com/package/enverify)

## Package Purpose

This package builds up your config object while verifying the existence of all environment variables. Optionally, it will throw upon finding a missing environment value. Similar to [Convict](https://github.com/mozilla/node-convict)

Certain types of apps require the use of different variables depending on the environment that the app is run in.

The purpose of this package is to fail early whenever one of those values is missing from the environment object (ie: `process.env`).

Using this package properly will prevent the sometimes cryptic errors that occur when environment variables are missing.

Because every missing environment variable that `enverify` encountered is returned (or is displayed in a thrown error), this package can also help with the: `run the app, app crashes because of missing environment variable, add environment variable, repeat` loop that sometimes occurs.

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

to get up and running quickly with a verified config file, you can replace the above with something like this:

```javascript
const { strictVerify } = require('enverify')

//throws on one or more env misses
module.exports = strictVerify({
  database: {
    name: 'DB_NAME',
    host: 'DB_HOST',
    password: 'DB_PASSWORD'
  },
  baseUrl: 'BASE_URL'
})
```

This package exposes two verification functions - `verify` and `strictVerify`. Use `verify` (as seen below) when you want to handle reporting missing values, and `strictVerify` (as seen above) when you want, when any `env` misses are encountered, a descriptive error containing all `env` misses to be thrown.

Use example for `verify`:

```javascript
const { verify } = require('enverify')

const { config, missingValues } = verify({
  database: {
    name: 'DB_NAME'
    host: 'DB_HOST'
    password: 'DB_PASSWORD'
  },
  baseUrl: 'BASE_URL'
})

// do custom error logging, possibly throw your own errors
missingValues.forEach(
  ({ envKey, path }) => console.log(`missing env variable: ${envKey} from config at path: ${path}`)
)

module.exports = config
```

You can pass in your own `env` object as a parameter as long as its an object that is non-nested and has key value pairs with `undefined` or `string` as their value type.

## Docs and Usage

The getting started portion of this README covers most basic use cases.

Please see [usage.md](docs/usage.md) for a more in-depth guide to `enverify`'s features, and the [examples](docs/examples/README.md) folder for a few examples on how to use this package.

### `enverify` vs `convict`

Mozilla produces the excellent [`convict`](https://github.com/mozilla/node-convict) package that does most (if not all) of the same things that this package does. Here are a quick list of comparisons between the two:

|Feature|`enverify`|`convict`|
|-|-|-|
| Config Merging | ⚠️ | ✔️ |
| Nested Structures | ✔️ | ✔️ |
| Environmental Variables | ✔️ | ✔️ |
| Command-line arguments | ❌ | ✔️ |
| Validation | ✔️ | ✔️ |
| Secret Obfuscation | ✔️ | ✔️ |

`convict` does more than what's included on the above list, and certainly more than `enverify` can do; so, it may be the correct choice for your project, especially if your project is a large one with many different/changing contributors.

However `enverify` excels in the following:

* Simplicity: Does one thing, and does it well
* Size: ~8kb packed, ~18kb unpacked, 4 source files total
* No production dependencies

## Prerequisites

This package is written in TypeScript@4.1.5 and is built/distributed for environments that support the majority of the es2016 specification.

This package also works best with projects that have centralized config files, IE: You map your `.env` variables to a `config` object in one or more files, and `import`/`require` that config object wherever you need `.env` values.

Other than that, just install the package and get going!

One of these:

```bash
npm install enverify
```

And one of these:

```javascript
const { verify, strictVerify } = require('enverify')
```

And you're all set.

## Testing

After you've ran `npm install`, just run `npm test`.

We use jest as our testing framework.

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/mattrcole/enverify/tags).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
