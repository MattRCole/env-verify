const { secret, strictVerify } = require('enverify')

const config = strictVerify({
  superSecretPassword: secret('SUPER_SECRET_PASSWORD')
})

// logs: { superSecretPassword: [secret] }
console.log(JSON.stringify(config))

// getting the password
var someLoginFunction

someLoginFunction(config.superSecretPassword.reveal())

// passes normal string that can be logged
// logs: ohn0myp@ssw0rd!!!Ims0bust3d
console.log(config.superSecretPassword.reveal())
