module.exports = {
  apiPort: process.env.API_PORT || 3001,
  clientPort: process.env.CLIENT_PORT || 3000,
  dbUser: process.env.DB_USER || "admin",
  dbPassword: process.env.DB_PASSWORD || "ece458duke",
  hashSecret: "ece458duke",
  sslSecret: "ece458duke"
}
