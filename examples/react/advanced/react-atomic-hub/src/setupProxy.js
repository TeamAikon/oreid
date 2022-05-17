const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use('/resizer.atomichub.io', 
  createProxyMiddleware({ 
    target: 'https://resizer.atomichub.io', 
    pathRewrite: { '^/resizer.atomichub.io': '' },
    changeOrigin: true } ))
};
