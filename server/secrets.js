module.exports = {
  port: process.env.API_PORT || 3001,
  dbUser: process.env.DB_USER || "admin",
  dbPassword: process.env.DB_PASSWORD || "ece458duke",
  hashSecret: "ece458duke",
}
