const { createProxyMiddleware } = require('http-proxy-middleware');

const context =  [
  "/api/terms",
  "/_configuration",
  "/.well-known",
  "/Identity",
  "/connect",
  "/ApplyDatabaseMigrations",
];

module.exports = function(app) {
  const appProxy = createProxyMiddleware(context, {
    target: 'https://localhost:5001',
    secure: false
  });

  app.use(appProxy);
};
