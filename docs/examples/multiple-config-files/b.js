const config = require('./config-b')

var someDbConnectionLibrary

class DbConnection {
  constructor(dbConfig) {
    this.host = dbConfig.host
    this.user = dbConfig.user
    this.password = dbConfig.password
  }
  setupConnection() {
    // set up database connection somehow
    this.connection = someDbConnectionLibrary.connect(this.host, this.user, this.password.reveal())
  }
}

const databaseConnection = new DbConnection(config.db)

module.exports = databaseConnection
