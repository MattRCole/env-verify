const { strictVerify, secret } = require('enverify')

module.exports = strictVerify({
  database: {
    host: 'DB_HOST_B',
    password: secret('DB_PASSWORD_B'),
    user: 'DB_USER_B'
  }
})
