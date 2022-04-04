import { verify, transform, secret } from 'enverify'

module.exports = verify({
  apiHosts: transform('API_HOSTS', hostCSV => hostCSV.split(',')),
  apiEndpoint: 'API_ENDPOINT',
  apiKey: secret('API_KEY')
})
