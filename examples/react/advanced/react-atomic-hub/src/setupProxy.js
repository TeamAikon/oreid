const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  const filter = (pathname, req) => {
    return req.hostname == 'localhost';
};

  app.use('/api', 
    createProxyMiddleware(filter, { 
      target: 'http://localhost:3001', 
      changeOrigin: true } 
      ))
};
