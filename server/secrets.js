module.exports = {
  proxyPort: process.env.PROXY_PORT || 3001,
  productionPort: process.env.PROD_PORT || 443,
  testPort: process.env.TEST_PORT || 3002,
  dbUser: process.env.DB_USER || "admin",
  dbPassword: process.env.DB_PASSWORD || "ece458duke",
  hashSecret: "ece458duke",
  sslSecret: "ece458duke",
  useProxy: (process.env.USE_PROXY === 'TRUE')
}
