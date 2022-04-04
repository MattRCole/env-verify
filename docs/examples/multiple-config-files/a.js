const axios = require('axios')
const { config, missingValues } = require('./config-a')

const getUsers = () => axios.get(
  `${config.apiHosts[0]}/${config.apiEndpoint}`,
  { headers: { Authorization: config.apiKey.reveal() }
}).catch(err => { err.missingEnvironmentValues = missingValues; return err })

module.exports = {
  getUsers
}
