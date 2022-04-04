const { insert, strictVerify } = require('enverify')

const config = strictVerify({
  appName: insert('my-amazing-app'),
  currentTime: insert(new Date()),
  environment: 'NODE_ENV',
  db: {
    host: 'DB_HOST',
    password: 'DB_PASSWORD',
    user: 'DB_USER'
  }
})

// logs: my-amazing-app
console.log(config.appName)

