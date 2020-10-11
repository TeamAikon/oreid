const { createProxyMiddleware } = require('http-proxy-middleware');

// Replaces any api key variable names with the actual secret value
function addOreIdApiKeys(req, res, next) {
  // // inject api-key and service-key(s) to header of request
  if(process.env.OREID_API_KEY) req.headers['api-key'] = process.env.OREID_API_KEY
  if(process.env.OREID_SERVICE_KEY) req.headers["service-key"] = process.env.OREID_SERVICE_KEY
  next()
}

// Appends Algorand api key to header
function addAlgorandApiKeys(req, res, next) {
  req.headers['x-api-key'] = process.env.ALGORAND_API_KEY
  next()
}

// Configure OREID Proxy
function oreidProxyMiddleware() {
  return createProxyMiddleware({ 
    target: process.env.REACT_APP_OREID_URL, 
    changeOrigin: true,
    // remove base path in incoming url
    pathRewrite: { '^/oreid': '' },
  })
}

// Configure Algrand Proxy
// React app path to algorand api is /algorand/testnet/xxx => https://testnet-algorand.api.purestake.io/xxx
function algorandProxyMiddleware() {
  return createProxyMiddleware({ 
    target: 'https://', // not used (replaced by router) but param is required
    changeOrigin: true,
    pathRewrite: { // remove base path in incoming url
      '^/algorand/mainnet': '',
      '^/algorand/testnet': '',
      '^/algorand/betanet': ''
    },
    router: { // map to endpoint
      '/algorand/mainnet' : 'https://mainnet-algorand.api.purestake.io',
      '/algorand/testnet' : 'https://testnet-algorand.api.purestake.io',
      '/algorand/betanet' : 'https://betanet-algorand.api.purestake.io',
    }
  })
}

module.exports = {
  addAlgorandApiKeys,
  addOreIdApiKeys,
  algorandProxyMiddleware,
  oreidProxyMiddleware,
}
